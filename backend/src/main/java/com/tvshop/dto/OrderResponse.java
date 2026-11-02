package com.tvshop.dto;

import com.tvshop.domain.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        OrderStatus status,
        BigDecimal total,
        String fullName,
        String phone,
        String email,
        String address,
        String comment,
        String managerComment,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {
}
