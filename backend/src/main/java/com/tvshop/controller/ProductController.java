package com.tvshop.controller;

import com.tvshop.dto.PageResponse;
import com.tvshop.dto.ProductResponse;
import com.tvshop.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public PageResponse<ProductResponse> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "40") int size,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String screenSize,
            @RequestParam(required = false) String technology,
            @RequestParam(required = false) BigDecimal priceMin,
            @RequestParam(required = false) BigDecimal priceMax,
            @RequestParam(required = false) String channels,
            @RequestParam(required = false) Integer powerOutputMin,
            @RequestParam(required = false) Integer powerOutputMax,
            @RequestParam(required = false) String resolution,
            @RequestParam(required = false) Integer luminousFluxMin,
            @RequestParam(required = false) Integer luminousFluxMax) {
        return productService.list(
                category, q, sort, page, size, true,
                brand, screenSize, technology, priceMin, priceMax,
                channels, powerOutputMin, powerOutputMax,
                resolution, luminousFluxMin, luminousFluxMax);
    }

    @GetMapping("/{slug}")
    public ProductResponse getBySlug(@PathVariable String slug) {
        return productService.getBySlug(slug);
    }
}
