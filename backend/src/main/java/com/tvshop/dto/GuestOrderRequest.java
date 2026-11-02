package com.tvshop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record GuestOrderRequest(
        @NotEmpty List<GuestOrderItem> items,
        @NotBlank String fullName,
        @NotBlank String phone,
        @NotBlank String email,
        @NotBlank String address,
        String comment
) {
    public record GuestOrderItem(
            @NotNull Long productId,
            int quantity
    ) {
    }
}
