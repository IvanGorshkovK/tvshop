package com.tvshop.service;

import com.tvshop.domain.Category;
import com.tvshop.dto.CategoryResponse;
import com.tvshop.exception.BadRequestException;
import com.tvshop.exception.NotFoundException;
import com.tvshop.repository.CategoryRepository;
import com.tvshop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryResponse(
                        c.getId(),
                        c.getName(),
                        c.getSlug(),
                        c.getIcon(),
                        productRepository.countByCategoryIdAndActiveTrue(c.getId())))
                .toList();
    }

    @Transactional
    public CategoryResponse create(String name, String slug, String icon) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Название категории обязательно");
        }
        Category c = new Category(name.trim(), slugify(slug == null || slug.isBlank() ? name : slug), icon);
        categoryRepository.save(c);
        return new CategoryResponse(c.getId(), c.getName(), c.getSlug(), c.getIcon(), 0);
    }

    @Transactional
    public void delete(Long id) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Категория не найдена"));
        if (productRepository.countByCategoryIdAndActiveTrue(id) > 0) {
            throw new BadRequestException("Нельзя удалить категорию с товарами");
        }
        categoryRepository.delete(c);
    }

    private String slugify(String s) {
        return s.toLowerCase()
                .replaceAll("[^a-z0-9а-яё]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
