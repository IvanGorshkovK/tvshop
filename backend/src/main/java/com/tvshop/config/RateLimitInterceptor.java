package com.tvshop.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiter limiter;

    public RateLimitInterceptor(RateLimiter limiter) {
        this.limiter = limiter;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws Exception {
        String path = req.getRequestURI();
        int limit = 0;
        if (path.equals("/api/auth/login") || path.equals("/api/auth/register")) {
            limit = 10; // защита от подбора пароля
        } else if (path.startsWith("/api/admin/ai/description") || path.startsWith("/api/admin/parse")) {
            limit = 30; // защита от спама LLM и парсера
        }
        if (limit == 0) {
            return true;
        }

        String key = path + ":" + clientIp(req);
        if (!limiter.allow(key, limit)) {
            res.setStatus(429);
            res.setContentType("application/json; charset=UTF-8");
            res.getWriter().write("{\"message\":\"Слишком много запросов, попробуйте позже\"}");
            return false;
        }
        return true;
    }

    private String clientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }
}
