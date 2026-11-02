package com.tvshop.config;

import com.tvshop.domain.Category;
import com.tvshop.domain.Product;
import com.tvshop.domain.Subcategory;
import com.tvshop.repository.CategoryRepository;
import com.tvshop.repository.ProductRepository;
import com.tvshop.repository.SubcategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Сидирует дополнительные категории и товары: Dyson, Игровые приставки, JBL.
 * Идемпотентно.
 */
@Component
@Order(7)
public class ExtraCatalogSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final SubcategoryRepository subcategoryRepository;
    private final ProductRepository productRepository;

    public ExtraCatalogSeeder(CategoryRepository categoryRepository,
                              SubcategoryRepository subcategoryRepository,
                              ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.subcategoryRepository = subcategoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedDyson();
        seedConsoles();
        seedJbl();
    }

    private void seedDyson() {
        if (categoryRepository.findBySlug("dyson").isPresent()) return;
        Category dyson = categoryRepository.save(new Category("Dyson", "dyson", "🌀"));
        String[] subs = {"Стайлеры", "Пылесосы", "Очистители", "Фены", "Выпрямители"};
        for (int i = 0; i < subs.length; i++) {
            Subcategory s = new Subcategory();
            s.setCategoryId(dyson.getId());
            s.setTitle(subs[i]);
            s.setQuery("category=dyson&q=" + enc(subs[i]));
            s.setPosition(i);
            subcategoryRepository.save(s);
        }
    }

    private void seedConsoles() {
        if (categoryRepository.findBySlug("igrovye-pristavki").isPresent()) return;
        Category consoles = categoryRepository.save(new Category("Игровые приставки", "igrovye-pristavki", "🎮"));

        addProduct(consoles, "Игровая приставка Xbox Series X", "xbox-series-x", "Xbox", "59990",
                "Консоль нового поколения 4K/120fps, 1 ТБ SSD.");
        addProduct(consoles, "Игровая приставка PlayStation 5", "playstation-5", "PlayStation", "59990",
                "Консоль Sony: трассировка лучей, SSD, 4K/120fps.");
        addProduct(consoles, "Игровая приставка Nintendo Switch OLED", "nintendo-switch-oled", "Nintendo", "29990",
                "Гибридная консоль с OLED-экраном 7 дюймов.");
        addProduct(consoles, "Игровая приставка Steam Deck OLED", "steam-deck-oled", "Steam", "49990",
                "Портативный ПК для игр Steam, OLED-экран.");
    }

    private void seedJbl() {
        if (categoryRepository.findBySlug("jbl").isPresent()) return;
        categoryRepository.save(new Category("JBL", "jbl", "🎧"));
    }

    private void addProduct(Category category, String name, String slug, String brand, String price, String description) {
        Product p = new Product();
        p.setName(name);
        p.setSlug(slug);
        p.setBrand(brand);
        p.setPrice(new BigDecimal(price));
        p.setStock(30);
        p.setActive(true);
        p.setCategory(category);
        p.setDescription(description);
        p.setSmartTv(false);
        productRepository.save(p);
    }

    private String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
