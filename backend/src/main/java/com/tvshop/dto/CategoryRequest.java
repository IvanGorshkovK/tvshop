package com.tvshop.dto;

public record CategoryRequest(
        String name,
        String slug,
        String icon
) {
}
