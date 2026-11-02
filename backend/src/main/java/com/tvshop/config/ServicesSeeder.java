package com.tvshop.config;

import com.tvshop.domain.Category;
import com.tvshop.domain.Product;
import com.tvshop.repository.CategoryRepository;
import com.tvshop.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Внутренняя категория «Услуги» (не отображается на сайте) — используется
 * только в админке для оформления заказов по телефону.
 */
@Component
@Order(2)
public class ServicesSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public ServicesSeeder(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Category services = categoryRepository.findBySlug("uslugi").orElse(null);
        if (services == null) {
            services = new Category("Услуги", "uslugi", "🛠️");
            services.setHidden(true);
            services = categoryRepository.save(services);
        } else if (!services.isHidden()) {
            services.setHidden(true);
            services = categoryRepository.save(services);
        }

        service(services, "Установка", "usluga-ustanovka", "1500",
                "Установка и настройка техники на месте (ТВ, саундбар, проектор).");
        service(services, "Доставка", "usluga-dostavka", "500",
                "Доставка по Москве и Московской области.");
        service(services, "Проверка на битые пиксели", "usluga-proverka-pikseli", "300",
                "Проверка экрана на битые пиксели и засветы перед установкой.");
    }

    private void service(Category category, String name, String slug, String price, String description) {
        if (productRepository.findBySlug(slug).isPresent()) {
            return;
        }
        Product p = new Product();
        p.setName(name);
        p.setSlug(slug);
        p.setDescription(description);
        p.setPrice(new BigDecimal(price));
        p.setBrand("TV Space");
        p.setStock(999);
        p.setActive(true);
        p.setCategory(category);
        p.setSmartTv(false);
        productRepository.save(p);
    }
}
