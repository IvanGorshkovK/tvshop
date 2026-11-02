package com.tvshop.repository;

import com.tvshop.domain.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {
    List<Subcategory> findByCategoryIdOrderByPositionAscIdAsc(Long categoryId);
    void deleteByCategoryId(Long categoryId);
}
