package com.tvshop.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Мелкие правки схемы, которые Hibernate ddl-auto=update не делает сам
 * (например, снятие NOT NULL с существующей колонки).
 */
@Component
public class SchemaMigration implements ApplicationRunner {

    private final JdbcTemplate jdbc;

    public SchemaMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Быстрые заказы «в 1 клик» могут быть без пользователя (гостевые)
        try {
            jdbc.execute("ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL");
        } catch (Exception ignored) {
            // колонка уже nullable или таблица ещё не создана — не страшно
        }
        // Единая формулировка категории
        try {
            jdbc.update("UPDATE categories SET name = 'Аудиосистемы' WHERE slug = 'audio-sistemy'");
        } catch (Exception ignored) {
            // категория не найдена — не страшно
        }
    }
}
