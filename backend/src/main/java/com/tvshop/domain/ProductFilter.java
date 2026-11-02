package com.tvshop.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_filters")
@Getter
@Setter
@NoArgsConstructor
public class ProductFilter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_slug", length = 60)
    private String categorySlug;

    @Column(name = "filter_key", length = 60)
    private String filterKey;

    @Column(length = 120)
    private String label;

    @Column(length = 20)
    private String type;

    @Column(length = 500)
    private String options;

    private Integer position;
}
