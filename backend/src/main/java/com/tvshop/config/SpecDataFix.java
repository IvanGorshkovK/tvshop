package com.tvshop.config;

import com.tvshop.domain.Product;
import com.tvshop.domain.SpecEntry;
import com.tvshop.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Iterator;

/**
 * Правка данных: удаляет характеристику «Тип экрана» у всех товаров
 * и добавляет вместо неё «Технология экрана: RGB MiniLED». Идемпотентно.
 */
@Component
@Order(4)
public class SpecDataFix implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SpecDataFix.class);

    private final ProductRepository productRepository;

    public SpecDataFix(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        int removed = 0;
        int added = 0;
        for (Product p : productRepository.findAll()) {
            boolean hadScreenType = false;
            Iterator<SpecEntry> it = p.getSpecifications().iterator();
            while (it.hasNext()) {
                if ("Тип экрана".equals(it.next().getName())) {
                    it.remove();
                    removed++;
                    hadScreenType = true;
                }
            }
            if (hadScreenType) {
                boolean has = p.getSpecifications().stream()
                        .anyMatch(s -> "Технология экрана".equals(s.getName())
                                && "RGB MiniLED".equals(s.getValue()));
                if (!has) {
                    p.getSpecifications().add(new SpecEntry("Технология экрана", "RGB MiniLED", "Экран"));
                    added++;
                }
            }
        }
        if (removed > 0) {
            log.info("Удалена характеристика «Тип экрана» у {} записей", removed);
        }
        if (added > 0) {
            log.info("Добавлена характеристика «Технология экрана: RGB MiniLED» для {} товаров", added);
        }
    }
}
