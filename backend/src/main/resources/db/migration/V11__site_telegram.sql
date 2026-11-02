-- =====================================================
-- V11: telegram-контакт в site_content
-- =====================================================

alter table site_content add column if not exists telegram varchar(100);
