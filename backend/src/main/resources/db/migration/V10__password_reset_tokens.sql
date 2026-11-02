-- =====================================================
-- V10: токены восстановления пароля
-- =====================================================

create table if not exists password_reset_tokens (
    id bigserial primary key,
    token varchar(64) not null unique,
    user_id bigint,
    expires_at timestamp not null,
    used boolean not null default false,
    constraint fk_pwd_reset_user foreign key (user_id) references users (id)
);
