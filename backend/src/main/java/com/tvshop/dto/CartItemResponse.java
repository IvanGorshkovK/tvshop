package com.tvshop.dto;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long productId,
        String productName,
        String slug,
        String imageUrl,
        BigDecimal price,
        Integer quantity,
        Integer stock
) {
}
