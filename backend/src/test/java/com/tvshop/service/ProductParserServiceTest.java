package com.tvshop.service;

import com.tvshop.exception.BadRequestException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;

class ProductParserServiceTest {

    private final ProductParserService service = new ProductParserService();

    @Test
    void rejectsLocalhost() {
        assertThrows(BadRequestException.class, () -> service.parse("http://localhost:8080"));
        assertThrows(BadRequestException.class, () -> service.parse("https://localhost"));
    }

    @Test
    void rejectsPrivateIps() {
        assertThrows(BadRequestException.class, () -> service.parse("http://192.168.1.1"));
        assertThrows(BadRequestException.class, () -> service.parse("http://10.0.0.1"));
        assertThrows(BadRequestException.class, () -> service.parse("http://172.16.0.1"));
    }

    @Test
    void rejectsNonHttpScheme() {
        assertThrows(BadRequestException.class, () -> service.parse("file:///etc/passwd"));
        assertThrows(BadRequestException.class, () -> service.parse("ftp://example.com"));
    }
}
