package com.tvshop.service;

import com.tvshop.domain.Category;
import com.tvshop.domain.Product;
import com.tvshop.domain.SpecEntry;
import com.tvshop.dto.PageResponse;
import com.tvshop.dto.ProductRequest;
import com.tvshop.dto.ProductResponse;
import com.tvshop.dto.SpecEntryRequest;
import com.tvshop.exception.NotFoundException;
import com.tvshop.repository.CategoryRepository;
import com.tvshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
            String resolution, Integer luminousFluxMin, Integer luminousFluxMax) {

        Specification<Product> spec = Specification.where(null);

        if (activeOnly) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("active"), true));
        }
        if (categorySlug != null && !categorySlug.isBlank()) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("category").get("slug"), categorySlug));
        }
        if (query != null && !query.isBlank()) {
            String q = "%" + query.trim().toLowerCase() + "%";
            spec = spec.and((root, cq, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), q),
                    cb.like(cb.lower(cb.coalesce(root.get("brand"), "")), q),
                    cb.like(cb.lower(cb.coalesce(root.get("description"), "")), q)
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
    public ProductResponse getBySlug(String slug) {
        Product p = productRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Товар не найден"));
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

    @Transactional
    public ProductResponse create(ProductRequest req) {
        Product p = new Product();
        applyRequest(p, req, null);
        productRepository.save(p);
        return toResponse(p);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Товар не найден"));
        applyRequest(p, req, id);
        productRepository.save(p);
        return toResponse(p);
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Товар не найден");
        }
        productRepository.deleteById(id);
    }

    @Transactional
    public ProductResponse toggleActive(Long id, boolean active) {
        Product p = getEntity(id);
        p.setActive(active);
        productRepository.save(p);
        return toResponse(p);
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
                    specs.add(new SpecEntry(s.name(), s.value() != null ? s.value() : ""));
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

    private ProductResponse toResponse(Product p) {
        Map<String, String> specs = new LinkedHashMap<>();
        if (p.getSpecifications() != null) {
            for (SpecEntry e : p.getSpecifications()) {
                specs.put(e.getName(), e.getValue());
            }
        }
        List<String> images = (p.getImages() != null && !p.getImages().isEmpty())
                ? p.getImages().stream().map(this::resolveUrl).toList()
                : (p.getImageUrl() != null && !p.getImageUrl().isBlank())
                        ? List.of(resolveUrl(p.getImageUrl()))
                        : List.of();
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
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
