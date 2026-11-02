package com.tvshop.repository;

import com.tvshop.domain.ProductFilter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductFilterRepository extends JpaRepository<ProductFilter, Long> {
    List<ProductFilter> findByCategorySlugOrderByPositionAscIdAsc(String categorySlug);
    List<ProductFilter> findAllByOrderByCategorySlugAscPositionAscIdAsc();
}
