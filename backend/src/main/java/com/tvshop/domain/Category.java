package com.tvshop.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    private String icon;

    @Column(nullable = false)
    private boolean hidden = false;

    @OneToMany(mappedBy = "category")
    private List<Product> products = new ArrayList<>();

    public Category(String name, String slug, String icon) {
        this.name = name;
        this.slug = slug;
        this.icon = icon;
    }
}
