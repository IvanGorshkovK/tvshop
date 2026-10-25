package com.tvshop.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        String productName,
        String imageUrl,
        BigDecimal price,
        Integer quantity
) {
}
