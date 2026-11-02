package com.tvshop.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * In-memory кэш каталога (Caffeine) — на один инстанс.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cm = new CaffeineCacheManager("products", "categories");
        cm.setCaffeine(Caffeine.newBuilder()
                .maximumSize(3000)
                .expireAfterWrite(Duration.ofMinutes(15)));
        return cm;
    }
}
