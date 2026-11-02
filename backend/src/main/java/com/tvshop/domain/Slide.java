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
@Table(name = "slides")
@Getter
@Setter
@NoArgsConstructor
public class Slide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer position;

    @Column(length = 60)
    private String tag;

    @Column(length = 200)
    private String title;

    @Column(length = 500)
    private String text;

    @Column(length = 20)
    private String icon;

    @Column(length = 300)
    private String link;

    @Column(length = 500)
    private String image;
}
