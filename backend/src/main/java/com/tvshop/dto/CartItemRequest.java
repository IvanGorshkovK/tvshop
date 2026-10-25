package com.tvshop.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CartItemRequest(
        @NotNull Long productId,
        @NotNull @Positive Integer quantity
) {
}
