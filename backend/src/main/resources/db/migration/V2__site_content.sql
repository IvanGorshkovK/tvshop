-- =====================================================
-- V2: контент сайта (герой, слайдер, контакты) — singleton
-- =====================================================

create table if not exists site_content (
    id bigint primary key,
    hero_title varchar(500),
    hero_subtitle varchar(1000),
    hero_image varchar(500),
    slide1_title varchar(200),
    slide1_text varchar(500),
    slide1_icon varchar(20),
    slide1_tag varchar(60),
    slide1_link varchar(300),
    slide2_title varchar(200),
    slide2_text varchar(500),
    slide2_icon varchar(20),
    slide2_tag varchar(60),
    slide2_link varchar(300),
    phone varchar(40),
    email varchar(120),
    city varchar(60),
    delivery_text varchar(200)
);
