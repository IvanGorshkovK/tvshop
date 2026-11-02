package com.tvshop.repository;

import com.tvshop.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsByCode(String code);
    long countByCategoryIdAndActiveTrue(Long categoryId);

    @Query("select p.slug from Product p where p.active = true and p.category.hidden = false")
    List<String> findAllVisibleSlugs();
}
