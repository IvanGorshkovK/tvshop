package com.tvshop.dto;

import java.util.List;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String icon,
        boolean hidden,
        long productCount,
        List<SubcategoryResponse> subcategories
) {
}
