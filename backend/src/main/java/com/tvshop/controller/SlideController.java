package com.tvshop.controller;

import com.tvshop.domain.Slide;
import com.tvshop.service.SlideService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SlideController {

    private final SlideService service;

    public SlideController(SlideService service) {
        this.service = service;
    }

    @GetMapping("/api/slides")
    public List<Slide> list() {
        return service.list();
    }

    @PostMapping("/api/admin/slides")
    public Slide create(@RequestBody Slide slide) {
        return service.create(slide);
    }

    @PutMapping("/api/admin/slides/{id}")
    public Slide update(@PathVariable Long id, @RequestBody Slide slide) {
        return service.update(id, slide);
    }

    @DeleteMapping("/api/admin/slides/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
