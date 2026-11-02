package com.tvshop.dto;

import java.math.BigDecimal;

public record OrderItemUpdateRequest(
        Long productId,
        int quantity,
        BigDecimal price
) {
}
