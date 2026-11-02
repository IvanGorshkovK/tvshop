package com.tvshop.dto;

import java.util.List;

public record FilterResponse(
        Long id,
        String categorySlug,
        String key,
        String label,
        String type,
        List<String> options
) {
}
