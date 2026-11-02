package com.tvshop.service;

import com.tvshop.domain.Category;
import com.tvshop.domain.Product;
import com.tvshop.domain.SpecEntry;
import com.tvshop.dto.PageResponse;
import com.tvshop.dto.ProductRequest;
import com.tvshop.dto.ProductResponse;
import com.tvshop.dto.SpecEntryRequest;
import com.tvshop.dto.SpecEntryResponse;
import com.tvshop.exception.NotFoundException;
import com.tvshop.repository.CategoryRepository;
import com.tvshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Value("${app.base-url:}")
    private String baseUrl;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> list(
            String categorySlug, String query, String sort,
            int page, int size, boolean activeOnly,
            String brand, String screenSize, String technology,
            BigDecimal priceMin, BigDecimal priceMax,
            String channels, Integer powerOutputMin, Integer powerOutputMax,
            String resolution, Integer luminousFluxMin, Integer luminousFluxMax,
            String collection) {

        Specification<Product> spec = Specification.where(null);

        if (activeOnly) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("active"), true));
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("category").get("hidden"), false));
        }
        if (categorySlug != null && !categorySlug.isBlank()) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("category").get("slug"), categorySlug));
        }
        if (query != null && !query.isBlank()) {
            String q = "%" + query.trim().toLowerCase() + "%";
            spec = spec.and((root, cq, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), q),
                    cb.like(cb.lower(cb.coalesce(root.get("brand"), "")), q),
                    cb.like(cb.lower(cb.coalesce(root.get("description"), "")), q),
                    cb.like(cb.lower(cb.coalesce(root.get("code"), "")), q)
            ));
        }
        if (brand != null && !brand.isBlank()) {
            spec = spec.and(inStrings("brand", brand));
        }
        if (technology != null && !technology.isBlank()) {
            spec = spec.and(inStrings("technology", technology));
        }
        if (channels != null && !channels.isBlank()) {
            spec = spec.and(inStrings("channels", channels));
        }
        if (resolution != null && !resolution.isBlank()) {
            spec = spec.and(inStrings("resolution", resolution));
        }
        if (collection != null && !collection.isBlank()) {
            String c = collection.trim().toLowerCase();
            if ("interior".equals(c)) {
                // Интерьерные ТВ: Samsung The Frame (LS03), LG G6, Hisense S7S
                spec = spec.and((root, cq, cb) -> cb.or(
                        cb.like(cb.lower(root.get("name")), "%ls03%"),
                        cb.like(cb.lower(root.get("name")), "%s7s%"),
                        cb.like(cb.lower(root.get("name")), "%g6%")
                ));
            } else if ("8k".equals(c)) {
                spec = spec.and((root, cq, cb) -> cb.like(cb.lower(cb.coalesce(root.get("resolution"), "")), "%8k%"));
            }
        }
        if (screenSize != null && !screenSize.isBlank()) {
            List<Integer> sizes = Arrays.stream(screenSize.split(","))
                    .map(String::trim)
                    .filter(s -> s.matches("\\d+"))
                    .map(Integer::parseInt)
                    .toList();
            if (!sizes.isEmpty()) {
                spec = spec.and((root, cq, cb) -> root.get("screenSizeInches").in(sizes));
            }
        }
        if (priceMin != null) {
            spec = spec.and((root, cq, cb) -> cb.greaterThanOrEqualTo(root.get("price"), priceMin));
        }
        if (priceMax != null) {
            spec = spec.and((root, cq, cb) -> cb.lessThanOrEqualTo(root.get("price"), priceMax));
        }
        if (powerOutputMin != null) {
            spec = spec.and((root, cq, cb) -> cb.greaterThanOrEqualTo(root.get("powerOutputW"), powerOutputMin));
        }
        if (powerOutputMax != null) {
            spec = spec.and((root, cq, cb) -> cb.lessThanOrEqualTo(root.get("powerOutputW"), powerOutputMax));
        }
        if (luminousFluxMin != null) {
            spec = spec.and((root, cq, cb) -> cb.greaterThanOrEqualTo(root.get("luminousFluxLm"), luminousFluxMin));
        }
        if (luminousFluxMax != null) {
            spec = spec.and((root, cq, cb) -> cb.lessThanOrEqualTo(root.get("luminousFluxLm"), luminousFluxMax));
        }

        Sort sortOrder = switch (sort == null ? "" : sort) {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "name" -> Sort.by("name").ascending();
            default -> Sort.by("createdAt").descending();
        };

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Page<Product> result = productRepository.findAll(spec, PageRequest.of(safePage, safeSize, sortOrder));
        return new PageResponse<>(
                result.getContent().stream().map(this::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
    }

    private Specification<Product> inStrings(String field, String csv) {
        List<String> values = Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        if (values.isEmpty()) {
            return Specification.where(null);
        }
        return (root, cq, cb) -> root.get(field).in(values);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#slug")
    public ProductResponse getBySlug(String slug) {
        Product p = productRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Товар не найден"));
        if (p.getCategory().isHidden()) {
            throw new NotFoundException("Товар не найден");
        }
        return toResponse(p);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return toResponse(getEntity(id));
    }

    @Transactional(readOnly = true)
    public Product getEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Товар не найден"));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#ids.toString()")
    public List<ProductResponse> getByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return productRepository.findAllById(ids).stream().map(this::toResponse).toList();
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse create(ProductRequest req) {
        Product p = new Product();
        applyRequest(p, req, null);
        ensureCode(p);
        productRepository.save(p);
        return toResponse(p);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Товар не найден"));
        applyRequest(p, req, id);
        productRepository.save(p);
        return toResponse(p);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Товар не найден");
        }
        productRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse toggleActive(Long id, boolean active) {
        Product p = getEntity(id);
        p.setActive(active);
        productRepository.save(p);
        return toResponse(p);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse updatePrice(Long id, BigDecimal price) {
        Product p = getEntity(id);
        p.setPrice(price);
        productRepository.save(p);
        return toResponse(p);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void batch(List<Long> ids, String action) {
        if (ids == null || ids.isEmpty()) return;
        if ("delete".equals(action)) {
            productRepository.deleteAllById(ids);
            return;
        }
        boolean active = "show".equals(action);
        List<Product> products = productRepository.findAllById(ids);
        for (Product p : products) {
            p.setActive(active);
        }
        productRepository.saveAll(products);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public int importCsv(String csv) {
        int count = 0;
        if (csv == null || csv.isBlank()) return 0;
        String[] lines = csv.split("\\r?\\n");
        for (String line : lines) {
            String[] cols = line.split(";");
            if (cols.length < 2) continue;
            String name = cols[0].trim();
            if (name.isEmpty()) continue;
            BigDecimal price;
            try {
                price = new BigDecimal(cols[1].trim());
            } catch (Exception e) {
                continue;
            }
            String brand = cols.length > 2 ? cols[2].trim() : null;
            String catSlug = cols.length > 3 && !cols[3].isBlank() ? cols[3].trim() : "televizory";
            int stock = 30;
            if (cols.length > 4) {
                try {
                    stock = Integer.parseInt(cols[4].trim());
                } catch (Exception ignored) {
                }
            }
            Category category = categoryRepository.findBySlug(catSlug).orElse(null);
            if (category == null) continue;

            Product p = new Product();
            p.setName(name);
            p.setSlug(uniqueSlug(slugify(name), null));
            p.setPrice(price);
            p.setBrand(brand != null && !brand.isBlank() ? brand : null);
            p.setStock(stock);
            p.setActive(true);
            p.setCategory(category);
            p.setSmartTv(false);
            ensureCode(p);
            productRepository.save(p);
            count++;
        }
        return count;
    }

    private void applyRequest(Product p, ProductRequest req, Long excludeId) {
        p.setName(req.name().trim());
        String baseSlug = (req.slug() != null && !req.slug().isBlank()) ? slugify(req.slug()) : slugify(req.name());
        p.setSlug(uniqueSlug(baseSlug, excludeId));
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setOldPrice(req.oldPrice());
        p.setImageUrl(req.imageUrl());
        p.setBrand(req.brand());
        p.setScreenSizeInches(req.screenSizeInches());
        p.setResolution(req.resolution());
        p.setSmartTv(req.smartTv() != null ? req.smartTv() : false);
        p.setTechnology(req.technology());
        p.setRefreshRateHz(req.refreshRateHz());
        p.setHdr(req.hdr());
        p.setOs(req.os());
        p.setPowerOutputW(req.powerOutputW());
        p.setChannels(req.channels());
        p.setLuminousFluxLm(req.luminousFluxLm());
        p.setContrast(req.contrast());
        p.setStock(req.stock());
        p.setActive(req.active() != null ? req.active() : true);
        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new NotFoundException("Категория не найдена"));
        p.setCategory(category);

        if (req.specifications() != null) {
            List<SpecEntry> specs = new ArrayList<>();
            for (SpecEntryRequest s : req.specifications()) {
                if (s.name() != null && !s.name().isBlank()) {
                    specs.add(new SpecEntry(s.name(), s.value() != null ? s.value() : "", s.group()));
                }
            }
            p.setSpecifications(specs);
        }
        if (req.images() != null) {
            List<String> imgs = new ArrayList<>();
            for (String s : req.images()) {
                if (s != null && !s.isBlank()) {
                    imgs.add(s);
                }
            }
            p.setImages(imgs);
            if (!imgs.isEmpty() && (p.getImageUrl() == null || p.getImageUrl().isBlank())) {
                p.setImageUrl(imgs.get(0));
            }
        }
    }

    private String uniqueSlug(String base, Long excludeId) {
        String slug = base.isEmpty() ? "product" : base;
        int i = 2;
        while (true) {
            Optional<Product> existing = productRepository.findBySlug(slug);
            if (existing.isEmpty() || existing.get().getId().equals(excludeId)) {
                return slug;
            }
            slug = base + "-" + i++;
        }
    }

    private static final Map<Character, String> TRANSLIT = Map.ofEntries(
            Map.entry('а', "a"), Map.entry('б', "b"), Map.entry('в', "v"), Map.entry('г', "g"),
            Map.entry('д', "d"), Map.entry('е', "e"), Map.entry('ё', "e"), Map.entry('ж', "zh"),
            Map.entry('з', "z"), Map.entry('и', "i"), Map.entry('й', "y"), Map.entry('к', "k"),
            Map.entry('л', "l"), Map.entry('м', "m"), Map.entry('н', "n"), Map.entry('о', "o"),
            Map.entry('п', "p"), Map.entry('р', "r"), Map.entry('с', "s"), Map.entry('т', "t"),
            Map.entry('у', "u"), Map.entry('ф', "f"), Map.entry('х', "h"), Map.entry('ц', "ts"),
            Map.entry('ч', "ch"), Map.entry('ш', "sh"), Map.entry('щ', "sch"), Map.entry('ъ', ""),
            Map.entry('ы', "y"), Map.entry('ь', ""), Map.entry('э', "e"), Map.entry('ю', "yu"),
            Map.entry('я', "ya"));

    private String slugify(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toLowerCase().toCharArray()) {
            String t = TRANSLIT.get(c);
            if (t != null) {
                sb.append(t);
            } else if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) {
                sb.append(c);
            } else {
                sb.append('-');
            }
        }
        return sb.toString()
                .replaceAll("-+", "-")
                .replaceAll("(^-|-$)", "");
    }

    private String resolveUrl(String url) {
        if (url == null || url.isBlank() || url.startsWith("http")) return url;
        if (baseUrl == null || baseUrl.isBlank()) return url;
        String b = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String u = url.startsWith("/") ? url : "/" + url;
        return b + u;
    }

    public String generateCode() {
        for (int i = 0; i < 200; i++) {
            String code = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
            if (!productRepository.existsByCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Не удалось сгенерировать уникальный код товара");
    }

    private void ensureCode(Product p) {
        if (p.getCode() == null || p.getCode().isBlank()) {
            p.setCode(generateCode());
        }
    }

    private ProductResponse toResponse(Product p) {
        List<SpecEntryResponse> specs = (p.getSpecifications() != null)
                ? p.getSpecifications().stream()
                        .map(e -> new SpecEntryResponse(e.getName(), e.getValue(), e.getGroup()))
                        .toList()
                : List.of();
        List<String> images = (p.getImages() != null && !p.getImages().isEmpty())
                ? p.getImages().stream().map(this::resolveUrl).toList()
                : (p.getImageUrl() != null && !p.getImageUrl().isBlank())
                        ? List.of(resolveUrl(p.getImageUrl()))
                        : List.of();
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getCode(),
                p.getDescription(),
                p.getPrice(),
                p.getOldPrice(),
                resolveUrl(p.getImageUrl()),
                p.getBrand(),
                p.getScreenSizeInches(),
                p.getResolution(),
                p.getSmartTv(),
                p.getTechnology(),
                p.getRefreshRateHz(),
                p.getHdr(),
                p.getOs(),
                p.getPowerOutputW(),
                p.getChannels(),
                p.getLuminousFluxLm(),
                p.getContrast(),
                p.getStock(),
                p.getActive(),
                p.getCategory().getId(),
                p.getCategory().getName(),
                p.getCategory().getSlug(),
                p.getCreatedAt(),
                specs,
                images);
    }
}
