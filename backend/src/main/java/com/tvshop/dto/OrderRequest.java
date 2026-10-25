package com.tvshop.dto;

import jakarta.validation.constraints.NotBlank;

public record OrderRequest(
        @NotBlank String fullName,
        @NotBlank String phone,
        @NotBlank String email,
        @NotBlank String address,
        String comment
) {
}
