package com.tvshop.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tvshop.dto.ParseResponse;
import com.tvshop.dto.SpecEntryRequest;
import com.tvshop.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.InetAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Импорт товара по ссылке: скачивает страницу и вытаскивает название, цену
 * и характеристики (по известным шаблонам + общим эвристикам).
 */
@Service
public class ProductParserService {

    private final ObjectMapper mapper = new ObjectMapper();

    private static final String[] BRANDS = {
            "Samsung", "LG", "Hisense", "TCL", "Sony", "Philips", "Xiaomi", "Haier",
            "Onkron", "Ugreen", "Vital", "Apple", "Bose", "JBL", "Yamaha", "Sony"
    };

    public ParseResponse parse(String url) {
        if (url == null || url.isBlank()) {
            throw new BadRequestException("Укажите ссылку на товар");
        }
        String html = fetch(url);
        String name = extractName(html);
        BigDecimal price = extractPrice(html);
        String brand = extractBrand(html, name);
        List<SpecEntryRequest> specs = extractSpecs(html);
        if (name == null && specs.isEmpty()) {
            throw new BadRequestException("Не удалось распознать товар на странице. Попробуйте другой магазин.");
        }
        return new ParseResponse(name, price, brand, specs);
    }

    private void validateUrl(String url) {
        URI uri;
        try {
            uri = URI.create(url);
        } catch (Exception e) {
            throw new BadRequestException("Некорректная ссылка");
        }
        String scheme = uri.getScheme();
        if (scheme == null || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))) {
            throw new BadRequestException("Разрешены только ссылки http/https");
        }
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new BadRequestException("Не удалось определить адрес сайта");
        }
        String h = host.toLowerCase();
        if ("localhost".equals(h) || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) {
            throw new BadRequestException("Запрещено обращаться к внутренним адресам");
        }
        try {
            for (InetAddress addr : InetAddress.getAllByName(host)) {
                if (addr.isLoopbackAddress() || addr.isLinkLocalAddress()
                        || addr.isSiteLocalAddress() || addr.isAnyLocalAddress()) {
                    throw new BadRequestException("Запрещено обращаться к внутренним адресам");
                }
                byte[] ip = addr.getAddress();
                if (ip.length == 16 && (ip[0] & 0xfe) == 0xfc) {
                    // IPv6 ULA fc00::/7
                    throw new BadRequestException("Запрещено обращаться к внутренним адресам");
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Не удалось проверить адрес: " + e.getMessage());
        }
    }

    private String fetch(String url) {
        validateUrl(url);
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(20))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36")
                    .header("Accept-Language", "ru-RU,ru;q=0.9")
                    .GET()
                    .build();
            HttpResponse<String> resp = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(12))
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build()
                    .send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() >= 400) {
                throw new BadRequestException("Страница недоступна (HTTP " + resp.statusCode() + ")");
            }
            return resp.body();
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Не удалось загрузить страницу: " + e.getMessage());
        }
    }

    private String extractName(String html) {
        // h1 → og:title → title
        String h1 = first(html, "<h1[^>]*>(.*?)</h1>");
        if (h1 != null) return h1;
        String og = first(html, "<meta[^>]+property=[\"']og:title[\"'][^>]+content=[\"'](.*?)[\"']",
                "<meta[^>]+content=[\"'](.*?)[\"'][^>]+property=[\"']og:title[\"']");
        if (og != null) return og;
        return first(html, "<title[^>]*>(.*?)</title>");
    }

    private BigDecimal extractPrice(String html) {
        // JSON-LD offers.price
        BigDecimal jsonPrice = priceFromJsonLd(html);
        if (jsonPrice != null) return jsonPrice;
        // "12 345 ₽" / "12 345 руб" / "12 345 р."
        Matcher m = Pattern.compile("(\\d[\\d\\s]{2,})\\s*(?:₽|руб|р\\.)").matcher(html);
        BigDecimal max = null;
        while (m.find()) {
            String digits = m.group(1).replaceAll("\\s", "");
            try {
                BigDecimal v = new BigDecimal(digits);
                if (max == null || v.compareTo(max) > 0) max = v;
            } catch (Exception ignored) {
            }
        }
        return max;
    }

    private BigDecimal priceFromJsonLd(String html) {
        try {
            List<String> scripts = all(html, "<script[^>]*type=[\"']application/ld\\+json[\"'][^>]*>(.*?)</script>");
            for (String s : scripts) {
                JsonNode node = mapper.readTree(s);
                BigDecimal price = findProductPrice(node);
                if (price != null) return price;
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private BigDecimal findProductPrice(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (node.isArray()) {
            for (JsonNode n : node) {
                BigDecimal r = findProductPrice(n);
                if (r != null) return r;
            }
            return null;
        }
        if (!node.isObject()) return null;
        String type = node.path("@type").asText("");
        if ("Product".equals(type) || "Offer".equals(type)) {
            JsonNode offers = node.path("offers");
            JsonNode price = offers.isMissingNode() ? node.path("price") : offers.path("price");
            if (price.isNumber()) return price.decimalValue();
            if (price.isTextual()) {
                try { return new BigDecimal(price.asText().replaceAll("[^0-9.,]", "").replace(',', '.')); } catch (Exception ignored) {}
            }
        }
        // рекурсивно ищем вложенные Product
        for (JsonNode child : node) {
            BigDecimal r = findProductPrice(child);
            if (r != null) return r;
        }
        return null;
    }

    private String extractBrand(String html, String name) {
        // JSON-LD brand
        try {
            List<String> scripts = all(html, "<script[^>]*type=[\"']application/ld\\+json[\"'][^>]*>(.*?)</script>");
            for (String s : scripts) {
                JsonNode node = mapper.readTree(s);
                String b = findBrand(node);
                if (b != null) return b;
            }
        } catch (Exception ignored) {
        }
        // из названия — первое слово, если это известный бренд
        String title = name != null ? name : html;
        for (String b : BRANDS) {
            if (title.toLowerCase().contains(b.toLowerCase())) return b;
        }
        return null;
    }

    private String findBrand(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (node.isArray()) {
            for (JsonNode n : node) {
                String r = findBrand(n);
                if (r != null) return r;
            }
            return null;
        }
        if (!node.isObject()) return null;
        if ("Product".equals(node.path("@type").asText(""))) {
            JsonNode brand = node.path("brand");
            if (brand.isTextual() && !brand.asText().isBlank()) return brand.asText();
            if (brand.isObject() && !brand.path("name").asText().isBlank()) return brand.path("name").asText();
        }
        for (JsonNode child : node) {
            String r = findBrand(child);
            if (r != null) return r;
        }
        return null;
    }

    private List<SpecEntryRequest> extractSpecs(String html) {
        List<SpecEntryRequest> specs = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();

        // 1) televizory.pro и похожие: <span class="name">…</span> … <span class="val">…</span>
        Matcher m = Pattern.compile("<span[^>]*class=[\"']name[\"'][^>]*>(.*?)</span>[\\s\\S]*?<span[^>]*class=[\"']val[\"'][^>]*>(.*?)</span>",
                Pattern.CASE_INSENSITIVE | Pattern.DOTALL).matcher(html);
        while (m.find() && specs.size() < 200) {
            addSpec(specs, seen, clean(m.group(1)), clean(m.group(2)));
        }

        // 2) таблицы характеристик: <tr> с двумя ячейками
        if (specs.isEmpty()) {
            Matcher tr = Pattern.compile("<tr[^>]*>\\s*<t[dh][^>]*>(.*?)</t[dh]>\\s*<t[dh][^>]*>(.*?)</t[dh]>",
                    Pattern.CASE_INSENSITIVE | Pattern.DOTALL).matcher(html);
            while (tr.find() && specs.size() < 200) {
                String a = clean(tr.group(1));
                String b = clean(tr.group(2));
                if (a.length() > 2 && a.length() < 60 && b.length() < 500) {
                    addSpec(specs, seen, a, b);
                }
            }
        }

        // 3) JSON-LD additionalProperty
        if (specs.isEmpty()) {
            try {
                List<String> scripts = all(html, "<script[^>]*type=[\"']application/ld\\+json[\"'][^>]*>(.*?)</script>");
                for (String s : scripts) {
                    JsonNode node = mapper.readTree(s);
                    collectJsonLdSpecs(node, specs, seen);
                }
            } catch (Exception ignored) {
            }
        }

        return specs;
    }

    private void collectJsonLdSpecs(JsonNode node, List<SpecEntryRequest> specs, Set<String> seen) {
        if (node == null || node.isNull()) return;
        if (node.isArray()) {
            for (JsonNode n : node) collectJsonLdSpecs(n, specs, seen);
            return;
        }
        if (!node.isObject()) return;
        JsonNode props = node.path("additionalProperty");
        if (props.isArray()) {
            for (JsonNode p : props) {
                String n = p.path("name").asText(null);
                String v = p.path("value").asText(null);
                if (n != null && v != null && !n.isBlank() && !v.isBlank()) {
                    addSpec(specs, seen, n, v);
                }
            }
        }
        for (JsonNode child : node) {
            collectJsonLdSpecs(child, specs, seen);
        }
    }

    private void addSpec(List<SpecEntryRequest> specs, Set<String> seen, String name, String value) {
        if (name == null || name.isBlank() || value == null || value.isBlank()) return;
        name = name.trim();
        value = value.trim();
        String key = name.toLowerCase();
        if (seen.contains(key)) return;
        seen.add(key);
        specs.add(new SpecEntryRequest(name, value, null));
    }

    private String first(String html, String... patterns) {
        for (String p : patterns) {
            Matcher m = Pattern.compile(p, Pattern.CASE_INSENSITIVE | Pattern.DOTALL).matcher(html);
            if (m.find()) {
                String v = clean(m.group(1));
                if (v != null && !v.isBlank()) return v;
            }
        }
        return null;
    }

    private List<String> all(String html, String pattern) {
        List<String> res = new ArrayList<>();
        Matcher m = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE | Pattern.DOTALL).matcher(html);
        while (m.find()) {
            res.add(m.group(1));
        }
        return res;
    }

    private String clean(String s) {
        if (s == null) return null;
        return s.replaceAll("<[^>]+>", " ")
                .replace("&nbsp;", " ")
                .replace("&quot;", "\"")
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
