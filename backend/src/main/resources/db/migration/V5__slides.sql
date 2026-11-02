-- =====================================================
-- V5: слайды промо-слайдера (динамические)
-- =====================================================

create table if not exists slides (
    id bigserial primary key,
    position integer,
    tag varchar(60),
    title varchar(200),
    text varchar(500),
    icon varchar(20),
    link varchar(300),
    image varchar(500)
);
