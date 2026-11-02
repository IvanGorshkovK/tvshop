package com.tvshop.service;

import com.tvshop.domain.ProductFilter;
import com.tvshop.dto.FilterResponse;
import com.tvshop.exception.NotFoundException;
import com.tvshop.repository.ProductFilterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class ProductFilterService {

    private final ProductFilterRepository repository;

    public ProductFilterService(ProductFilterRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<FilterResponse> forCategory(String categorySlug) {
        return repository.findByCategorySlugOrderByPositionAscIdAsc(categorySlug)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductFilter> all() {
        return repository.findAllByOrderByCategorySlugAscPositionAscIdAsc();
    }

    @Transactional
    public ProductFilter create(ProductFilter filter) {
        if (filter.getPosition() == null) filter.setPosition(0);
        return repository.save(filter);
    }

    @Transactional
    public ProductFilter update(Long id, ProductFilter data) {
        ProductFilter f = repository.findById(id).orElseThrow(() -> new NotFoundException("Фильтр не найден"));
        f.setCategorySlug(data.getCategorySlug());
        f.setFilterKey(data.getFilterKey());
        f.setLabel(data.getLabel());
        f.setType(data.getType());
        f.setOptions(data.getOptions());
        if (data.getPosition() != null) f.setPosition(data.getPosition());
        return repository.save(f);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Фильтр не найден");
        }
        repository.deleteById(id);
    }

    private FilterResponse toResponse(ProductFilter f) {
        List<String> opts = (f.getOptions() == null || f.getOptions().isBlank())
                ? List.of()
                : Arrays.stream(f.getOptions().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList();
        return new FilterResponse(f.getId(), f.getCategorySlug(), f.getFilterKey(), f.getLabel(), f.getType(), opts);
    }
}
