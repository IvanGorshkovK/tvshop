package com.tvshop.dto;

import java.math.BigDecimal;
import java.util.List;

public record CounterpartyResponse(
        String key,
        String name,
        String phone,
        String email,
        int orderCount,
        BigDecimal totalSpent,
        List<OrderResponse> orders
) {
}
