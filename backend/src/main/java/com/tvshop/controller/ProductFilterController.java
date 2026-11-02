package com.tvshop.controller;

import com.tvshop.domain.ProductFilter;
import com.tvshop.dto.FilterResponse;
import com.tvshop.service.ProductFilterService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ProductFilterController {

    private final ProductFilterService service;

    public ProductFilterController(ProductFilterService service) {
        this.service = service;
    }

    @GetMapping("/api/filters")
    public List<FilterResponse> forCategory(@RequestParam(required = false) String category) {
        return service.forCategory(category == null ? "" : category);
    }

    @GetMapping("/api/admin/filters")
    public List<ProductFilter> all() {
        return service.all();
    }

    @PostMapping("/api/admin/filters")
    public ProductFilter create(@RequestBody ProductFilter filter) {
        return service.create(filter);
    }

    @PutMapping("/api/admin/filters/{id}")
    public ProductFilter update(@PathVariable Long id, @RequestBody ProductFilter filter) {
        return service.update(id, filter);
    }

    @DeleteMapping("/api/admin/filters/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
