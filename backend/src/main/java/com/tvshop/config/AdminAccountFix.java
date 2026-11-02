package com.tvshop.config;

import com.tvshop.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Обновляет существующий админ-аккаунт на новые данные (admin@mail.ru / bGarq8X#).
 * Идемпотентно: после первого запуска старого email уже нет.
 */
@Component
@Order(9)
public class AdminAccountFix implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountFix.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminAccountFix(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        userRepository.findByEmail("admin@tvspace.ru").ifPresent(old -> {
            old.setEmail("admin@mail.ru");
            old.setPassword(passwordEncoder.encode("bGarq8X#"));
            userRepository.save(old);
            log.info("Админ-аккаунт обновлён: admin@mail.ru");
        });
    }
}
