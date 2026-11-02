package com.tvshop.controller;

import com.tvshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * SEO: sitemap.xml и robots.txt для поисковиков.
 */
@RestController
public class SeoController {

    private final ProductRepository productRepository;

    @Value("${app.site-url:}")
    private String siteUrl;

    public SeoController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping(value = "/sitemap.xml", produces = "application/xml")
    public String sitemap() {
        String base = base();
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        sb.append("<url><loc>").append(base).append("/</loc></url>\n");
        sb.append("<url><loc>").append(base).append("/catalog</loc></url>\n");
        for (String slug : productRepository.findAllVisibleSlugs()) {
            sb.append("<url><loc>").append(base).append("/product/").append(slug).append("</loc></url>\n");
        }
        sb.append("</urlset>");
        return sb.toString();
    }

    @GetMapping(value = "/robots.txt", produces = "text/plain")
    public String robots() {
        String base = base();
        return "User-agent: *\nAllow: /\nSitemap: " + base + "/sitemap.xml\n";
    }

    private String base() {
        return (siteUrl == null || siteUrl.isBlank())
                ? "http://localhost:5173"
                : siteUrl.replaceAll("/+$", "");
    }
}
