package com.tvshop.dto;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String icon,
        long productCount
) {
}
