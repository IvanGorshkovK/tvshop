package com.tvshop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
        @NotBlank String name,
        String slug,
        String description,
        @NotNull @Positive BigDecimal price,
        BigDecimal oldPrice,
        String imageUrl,
        String brand,
        Integer screenSizeInches,
        String resolution,
        Boolean smartTv,
        String technology,
        Integer refreshRateHz,
        String hdr,
        String os,
        Integer powerOutputW,
        String channels,
        Integer luminousFluxLm,
        String contrast,
        @NotNull @PositiveOrZero Integer stock,
        Boolean active,
        @NotNull Long categoryId,
        List<SpecEntryRequest> specifications,
        List<String> images
) {
}
