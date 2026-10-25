package com.tvshop.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Генерация описаний товаров через LLM (DeepSeek, OpenAI-совместимый API).
 */
@Service
public class AiService {

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.base-url:https://api.deepseek.com}")
    private String baseUrl;

    @Value("${app.ai.model:deepseek-chat}")
    private String model;

    private final ObjectMapper mapper = new ObjectMapper();

    public String generateDescription(String name, String brand, String specs) {
        if (apiKey == null || apiKey.isBlank()) {
            return "AI-описание недоступно: не задан ключ API (DEEPSEEK_API_KEY).";
        }

        String prompt = "Напиши продающее описание товара на русском языке (2-3 предложения). " +
                "Не выдумывай характеристики, опирайся только на перечисленные. " +
                "Название: " + name + ". Бренд: " + (brand == null || brand.isBlank() ? "—" : brand) + ". " +
                "Характеристики: " + (specs == null || specs.isBlank() ? "—" : specs) + ".";

        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", model);
            body.put("temperature", 0.7);
            body.put("max_tokens", 400);
            body.put("messages", List.of(Map.of("role", "user", "content", prompt)));

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl.replaceAll("/+$", "") + "/chat/completions"))
                    .timeout(Duration.ofSeconds(45))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> resp = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(15))
                    .build()
                    .send(req, HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() >= 400) {
                return "Ошибка AI (" + resp.statusCode() + "): " + truncate(resp.body(), 200);
            }

            JsonNode root = mapper.readTree(resp.body());
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            return content.trim();
        } catch (Exception e) {
            return "Ошибка генерации: " + e.getMessage();
        }
    }

    private String truncate(String s, int n) {
        return s == null ? "" : (s.length() <= n ? s : s.substring(0, n));
    }
}
