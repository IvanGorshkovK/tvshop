package com.tvshop.config;

import org.springframework.stereotype.Component;

import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Простой in-memory ограничитель частоты запросов (на один инстанс).
 */
@Component
public class RateLimiter {

    private final Map<String, Deque<Long>> buckets = new ConcurrentHashMap<>();

    public boolean allow(String key, int maxPerMinute) {
        long now = System.currentTimeMillis();
        Deque<Long> dq = buckets.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());
        synchronized (dq) {
            while (!dq.isEmpty() && now - dq.peekFirst() > 60_000) {
                dq.pollFirst();
            }
            if (dq.size() >= maxPerMinute) {
                return false;
            }
            dq.addLast(now);
            return true;
        }
    }
}
