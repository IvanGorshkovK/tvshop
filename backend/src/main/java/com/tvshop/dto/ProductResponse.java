package com.tvshop.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record ProductResponse(
        Long id,
        String name,
        String slug,
        String description,
        BigDecimal price,
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
        Integer stock,
        Boolean active,
        Long categoryId,
        String categoryName,
        String categorySlug,
        LocalDateTime createdAt,
        Map<String, String> specifications,
        List<String> images
) {
}
