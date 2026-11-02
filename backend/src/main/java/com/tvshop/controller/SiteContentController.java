package com.tvshop.controller;

import com.tvshop.domain.SiteContent;
import com.tvshop.service.SiteContentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class SiteContentController {

    private final SiteContentService service;

    public SiteContentController(SiteContentService service) {
        this.service = service;
    }

    @GetMapping("/api/site")
    public SiteContent get() {
        return service.get();
    }

    @PutMapping("/api/admin/site")
    public SiteContent update(@RequestBody Map<String, String> data) {
        return service.update(data);
    }
}
