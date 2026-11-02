package com.tvshop.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Контент сайта (singleton, id=1): герой, слайдер, контакты.
 * Редактируется вручную в админке (раздел «Сайт»).
 */
@Entity
@Table(name = "site_content")
@Getter
@Setter
@NoArgsConstructor
public class SiteContent {

    @Id
    private Long id = 1L;

    @Column(length = 500)
    private String heroTitle;

    @Column(length = 1000)
    private String heroSubtitle;

    @Column(length = 500)
    private String heroImage;

    @Column(length = 200)
    private String slide1Title;

    @Column(length = 500)
    private String slide1Text;

    @Column(length = 20)
    private String slide1Icon;

    @Column(length = 60)
    private String slide1Tag;

    @Column(length = 300)
    private String slide1Link;

    @Column(length = 500)
    private String slide1Image;

    @Column(length = 200)
    private String slide2Title;

    @Column(length = 500)
    private String slide2Text;

    @Column(length = 20)
    private String slide2Icon;

    @Column(length = 60)
    private String slide2Tag;

    @Column(length = 300)
    private String slide2Link;

    @Column(length = 500)
    private String slide2Image;

    @Column(length = 40)
    private String phone;

    @Column(length = 120)
    private String email;

    @Column(length = 100)
    private String telegram;

    @Column(length = 60)
    private String city;

    @Column(length = 200)
    private String deliveryText;
}
