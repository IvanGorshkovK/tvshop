package com.tvshop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record QuickOrderRequest(
        @NotNull Long productId,
        Integer quantity,
        @NotBlank String fullName,
        @NotBlank String phone,
        String email,
        String address
) {
}
