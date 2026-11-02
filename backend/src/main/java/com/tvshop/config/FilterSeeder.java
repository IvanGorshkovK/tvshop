package com.tvshop.config;

import com.tvshop.domain.ProductFilter;
import com.tvshop.repository.ProductFilterRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Сидирует дефолтные фильтры каталога, если их нет.
 */
@Component
@Order(6)
public class FilterSeeder implements CommandLineRunner {

    private final ProductFilterRepository repository;

    public FilterSeeder(ProductFilterRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;

        add("televizory", "brand", "Производитель", "checkbox", "Samsung,LG,Hisense,TCL", 0);
        add("televizory", "price", "Цена, ₽", "range", null, 1);
        add("televizory", "screenSize", "Диагональ", "checkbox", "32,43,50,55,65,75,85,100", 2);
        add("televizory", "technology", "Тип технологии", "checkbox", "QLED,OLED,LED,NanoCell,Mini-LED", 3);
        add("televizory", "resolution", "Разрешение экрана", "checkbox", "HD,Full HD,4K UHD,8K", 4);

        add("audio-sistemy", "brand", "Производитель", "checkbox", "Samsung,LG,Hisense", 0);
        add("audio-sistemy", "price", "Цена, ₽", "range", null, 1);
        add("audio-sistemy", "powerOutput", "Общая выходная мощность, Вт", "range", null, 2);
        add("audio-sistemy", "channels", "Количество каналов", "checkbox", "2.0,2.1,3.1.2", 3);

        add("proektory", "brand", "Производитель", "checkbox", "Hisense", 0);
        add("proektory", "price", "Цена, ₽", "range", null, 1);
        add("proektory", "luminousFlux", "Световой поток, лм", "range", null, 2);
        add("proektory", "resolution", "Разрешение", "checkbox", "4K UHD,Full HD", 3);
    }

    private void add(String cat, String key, String label, String type, String options, int pos) {
        ProductFilter f = new ProductFilter();
        f.setCategorySlug(cat);
        f.setFilterKey(key);
        f.setLabel(label);
        f.setType(type);
        f.setOptions(options);
        f.setPosition(pos);
        repository.save(f);
    }
}
