package com.tvshop.config;

import com.tvshop.domain.Product;
import com.tvshop.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Присваивает уникальный шестизначный код товарам, у которых его ещё нет.
 */
@Component
@Order(8)
public class ProductCodeFix implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductCodeFix.class);

    private final ProductRepository productRepository;

    public ProductCodeFix(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<Product> all = productRepository.findAll();
        Set<String> used = new HashSet<>();
        for (Product p : all) {
            if (p.getCode() != null && !p.getCode().isBlank()) {
                used.add(p.getCode());
            }
        }
        int assigned = 0;
        for (Product p : all) {
            if (p.getCode() != null && !p.getCode().isBlank()) continue;
            String code;
            do {
                code = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
            } while (used.contains(code));
            used.add(code);
            p.setCode(code);
            assigned++;
        }
        if (assigned > 0) {
            log.info("Присвоен уникальный код {} товарам", assigned);
        }
    }
}
