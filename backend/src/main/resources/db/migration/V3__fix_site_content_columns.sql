-- =====================================================
-- V3: исправление имён колонок slide1*/slide2*
-- (Hibernate не ставит "_" между цифрой и заглавной буквой)
-- =====================================================

alter table site_content rename column slide1_title to slide1title;
alter table site_content rename column slide1_text to slide1text;
alter table site_content rename column slide1_icon to slide1icon;
alter table site_content rename column slide1_tag to slide1tag;
alter table site_content rename column slide1_link to slide1link;
alter table site_content rename column slide2_title to slide2title;
alter table site_content rename column slide2_text to slide2text;
alter table site_content rename column slide2_icon to slide2icon;
alter table site_content rename column slide2_tag to slide2tag;
alter table site_content rename column slide2_link to slide2link;
