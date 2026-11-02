package com.tvshop.service;

import com.tvshop.domain.Category;
import com.tvshop.domain.Subcategory;
import com.tvshop.dto.CategoryResponse;
import com.tvshop.dto.SubcategoryResponse;
import com.tvshop.exception.BadRequestException;
import com.tvshop.exception.NotFoundException;
import com.tvshop.repository.CategoryRepository;
import com.tvshop.repository.ProductRepository;
import com.tvshop.repository.SubcategoryRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final SubcategoryRepository subcategoryRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           SubcategoryRepository subcategoryRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.subcategoryRepository = subcategoryRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'public'")
    public List<CategoryResponse> list() {
        return categoryRepository.findAll().stream()
                .filter(c -> !c.isHidden())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'all'")
    public List<CategoryResponse> listAll() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse create(String name, String slug, String icon) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Название категории обязательно");
        }
        Category c = new Category(name.trim(), slugify(slug == null || slug.isBlank() ? name : slug), icon);
        categoryRepository.save(c);
        return toResponse(c);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse toggleHidden(Long id) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Категория не найдена"));
        c.setHidden(!c.isHidden());
        categoryRepository.save(c);
        return toResponse(c);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public SubcategoryResponse addSubcategory(Long categoryId, String title, String query) {
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Название подкатегории обязательно");
        }
        Subcategory s = new Subcategory();
        s.setCategoryId(categoryId);
        s.setTitle(title.trim());
        s.setQuery(query == null ? "" : query.trim());
        List<Subcategory> list = subcategoryRepository.findByCategoryIdOrderByPositionAscIdAsc(categoryId);
        s.setPosition(list.isEmpty() ? 0 : list.get(list.size() - 1).getPosition() + 1);
        subcategoryRepository.save(s);
        return new SubcategoryResponse(s.getId(), s.getTitle(), s.getQuery());
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public SubcategoryResponse updateSubcategory(Long id, String title, String query) {
        Subcategory s = subcategoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Подкатегория не найдена"));
        if (title != null && !title.isBlank()) s.setTitle(title.trim());
        if (query != null) s.setQuery(query.trim());
        subcategoryRepository.save(s);
        return new SubcategoryResponse(s.getId(), s.getTitle(), s.getQuery());
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteSubcategory(Long id) {
        if (!subcategoryRepository.existsById(id)) {
            throw new NotFoundException("Подкатегория не найдена");
        }
        subcategoryRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void delete(Long id) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Категория не найдена"));
        if (productRepository.countByCategoryIdAndActiveTrue(id) > 0) {
            throw new BadRequestException("Нельзя удалить категорию с товарами");
        }
        subcategoryRepository.deleteByCategoryId(id);
        categoryRepository.delete(c);
    }

    private CategoryResponse toResponse(Category c) {
        List<SubcategoryResponse> subs = subcategoryRepository
                .findByCategoryIdOrderByPositionAscIdAsc(c.getId())
                .stream()
                .map(s -> new SubcategoryResponse(s.getId(), s.getTitle(), s.getQuery()))
                .toList();
        return new CategoryResponse(
                c.getId(),
                c.getName(),
                c.getSlug(),
                c.getIcon(),
                c.isHidden(),
                productRepository.countByCategoryIdAndActiveTrue(c.getId()),
                subs);
    }

    private String slugify(String s) {
        return s.toLowerCase()
                .replaceAll("[^a-z0-9а-яё]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
