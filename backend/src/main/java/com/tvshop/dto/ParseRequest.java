package com.tvshop.dto;

import jakarta.validation.constraints.NotBlank;

public record ParseRequest(
        @NotBlank String url
) {
}
