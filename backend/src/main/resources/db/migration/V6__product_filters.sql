-- =====================================================
-- V6: фильтры каталога (динамические)
-- =====================================================

create table if not exists product_filters (
    id bigserial primary key,
    category_slug varchar(60),
    filter_key varchar(60),
    label varchar(120),
    type varchar(20),
    options varchar(500),
    position integer
);
