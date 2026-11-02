-- =====================================================
-- V7: подкатегории товаров
-- =====================================================

create table if not exists subcategories (
    id bigserial primary key,
    category_id bigint,
    title varchar(120),
    query varchar(300),
    position integer
);
