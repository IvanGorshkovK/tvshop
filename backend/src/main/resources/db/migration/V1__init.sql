-- =====================================================
-- V1: базовая схема интернет-магазина TV Space
-- =====================================================

create table if not exists users (
    id bigserial primary key,
    email varchar(120) not null unique,
    password varchar(255) not null,
    full_name varchar(255),
    role varchar(20) not null
);

create table if not exists categories (
    id bigserial primary key,
    name varchar(120) not null unique,
    slug varchar(120) not null unique,
    icon varchar(255),
    hidden boolean not null default false
);

create table if not exists products (
    id bigserial primary key,
    name varchar(200) not null,
    slug varchar(200) not null unique,
    description varchar(5000),
    price numeric(12,2) not null,
    old_price numeric(12,2),
    image_url varchar(500),
    brand varchar(100),
    screen_size_inches integer,
    resolution varchar(50),
    smart_tv boolean,
    technology varchar(50),
    refresh_rate_hz integer,
    hdr varchar(100),
    os varchar(100),
    power_outputw integer,
    channels varchar(30),
    luminous_flux_lm integer,
    contrast varchar(50),
    stock integer not null,
    active boolean not null,
    category_id bigint not null,
    created_at timestamp,
    constraint fk_products_category foreign key (category_id) references categories (id)
);

create table if not exists product_specs (
    product_id bigint not null,
    spec_name varchar(200) not null,
    spec_value varchar(500),
    spec_group varchar(60),
    spec_order integer not null,
    constraint fk_product_specs_product foreign key (product_id) references products (id)
);

create table if not exists product_images (
    product_id bigint not null,
    image_url varchar(500),
    image_order integer not null,
    constraint fk_product_images_product foreign key (product_id) references products (id)
);

create table if not exists cart_items (
    id bigserial primary key,
    user_id bigint not null,
    product_id bigint not null,
    quantity integer not null,
    constraint fk_cart_user foreign key (user_id) references users (id),
    constraint fk_cart_product foreign key (product_id) references products (id)
);

create table if not exists orders (
    id bigserial primary key,
    user_id bigint,
    status varchar(20) not null,
    deleted boolean not null default false,
    total numeric(12,2) not null,
    full_name varchar(120),
    phone varchar(40),
    email varchar(120),
    address varchar(300),
    comment varchar(500),
    manager_comment varchar(500),
    created_at timestamp,
    constraint fk_orders_user foreign key (user_id) references users (id)
);

create table if not exists order_items (
    id bigserial primary key,
    order_id bigint not null,
    product_id bigint,
    product_name varchar(200) not null,
    image_url varchar(500),
    price numeric(12,2) not null,
    quantity integer not null,
    constraint fk_order_items_order foreign key (order_id) references orders (id),
    constraint fk_order_items_product foreign key (product_id) references products (id)
);

create table if not exists audit_log (
    id bigserial primary key,
    actor varchar(120),
    action varchar(60),
    entity varchar(60),
    entity_id bigint,
    detail varchar(500),
    created_at timestamp
);
