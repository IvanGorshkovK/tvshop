package com.tvshop.dto;

public record AuthResponse(
        String token,
        Long id,
        String email,
        String fullName,
        String role
) {
}
