-- =====================================================
-- V4: фоновые изображения слайдера (загружаемые вручную)
-- =====================================================

alter table site_content add column if not exists slide1image varchar(500);
alter table site_content add column if not exists slide2image varchar(500);
