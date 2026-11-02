package com.tvshop.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @Column(unique = true, length = 6)
    private String code;

    @Column(length = 5000)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(precision = 12, scale = 2)
    private BigDecimal oldPrice;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 100)
    private String brand;

    private Integer screenSizeInches;

    @Column(length = 50)
    private String resolution;

    private Boolean smartTv;

    /** Тип технологии/матрицы (ТВ: QLED/OLED/LED/NanoCell; проектор: Лазерный/DLP) */
    @Column(length = 50)
    private String technology;

    /** Частота обновления, Гц (ТВ) */
    private Integer refreshRateHz;

    /** Поддержка HDR (ТВ/проектор) */
    @Column(length = 100)
    private String hdr;

    /** Операционная система (ТВ/проектор) */
    @Column(length = 100)
    private String os;

    /** Общая выходная мощность, Вт (аудио) */
    private Integer powerOutputW;

    /** Количество каналов (аудио): "2.0", "2.1", "3.1.2" */
    @Column(length = 30)
    private String channels;

    /** Световой поток, лм (проектор) */
    private Integer luminousFluxLm;

    /** Контрастность (проектор) */
    @Column(length = 50)
    private String contrast;

    /** Полные характеристики (упорядоченный список) */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_specs", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "spec_order")
    private List<SpecEntry> specifications = new ArrayList<>();

    /** Фотографии товара (несколько) */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "image_order")
    @Column(name = "image_url", length = 500)
    private List<String> images = new ArrayList<>();

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
