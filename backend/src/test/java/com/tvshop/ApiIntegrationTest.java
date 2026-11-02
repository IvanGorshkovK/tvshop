package com.tvshop;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ApiIntegrationTest {

    @Autowired
    private TestRestTemplate rest;

    @Test
    void categoriesArePublic() {
        var res = rest.getForEntity("/api/categories", String.class);
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void adminCanLogin() {
        var res = rest.postForEntity(
                "/api/auth/login",
                Map.of("email", "admin@tvspace.ru", "password", "admin123"),
                String.class);
        assertEquals(200, res.getStatusCode().value());
    }
}
