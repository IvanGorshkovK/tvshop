package com.tvshop.config;

import com.tvshop.domain.Slide;
import com.tvshop.repository.SlideRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Сидирует два стартовых слайда, если слайдер пуст.
 */
@Component
@Order(5)
public class SlideSeeder implements CommandLineRunner {

    private final SlideRepository repository;

    public SlideSeeder(SlideRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;

        Slide s1 = new Slide();
        s1.setPosition(0);
        s1.setTag("Интерьерные");
        s1.setTitle("Интерьерные телевизоры");
        s1.setText("Samsung The Frame, LG G6 и Hisense S7S — телевизор как предмет интерьера.");
        s1.setIcon("🖼️");
        s1.setLink("/catalog?category=televizory&collection=interior");
        repository.save(s1);

        Slide s2 = new Slide();
        s2.setPosition(1);
        s2.setTag("Максимальная детализация");
        s2.setTitle("Телевизоры с разрешением 8K UHD");
        s2.setText("Samsung 8K — невероятная чёткость и детализация изображения.");
        s2.setIcon("📺");
        s2.setLink("/catalog?category=televizory&collection=8k");
        repository.save(s2);
    }
}
