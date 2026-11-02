package com.tvshop.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        String role,
        boolean active,
        LocalDateTime createdAt,
        int orderCount,
        BigDecimal totalSpent,
        List<OrderResponse> orders
) {
}
