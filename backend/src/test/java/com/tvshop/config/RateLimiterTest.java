package com.tvshop.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RateLimiterTest {

    @Test
    void allowsUpToLimitThenBlocks() {
        RateLimiter limiter = new RateLimiter();
        for (int i = 0; i < 5; i++) {
            assertTrue(limiter.allow("key", 5), "запрос " + i + " должен пройти");
        }
        assertFalse(limiter.allow("key", 5), "шестой запрос должен быть заблокирован");
    }

    @Test
    void differentKeysAreIndependent() {
        RateLimiter limiter = new RateLimiter();
        assertTrue(limiter.allow("a", 1));
        assertFalse(limiter.allow("a", 1));
        assertTrue(limiter.allow("b", 1), "другой ключ не должен блокироваться");
    }
}
