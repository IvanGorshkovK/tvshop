-- =====================================================
-- V8: активность и дата регистрации пользователей
-- =====================================================

alter table users add column if not exists active boolean not null default true;
alter table users add column if not exists created_at timestamp;
