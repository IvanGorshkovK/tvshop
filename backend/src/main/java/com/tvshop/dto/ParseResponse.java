package com.tvshop.dto;

import java.math.BigDecimal;
import java.util.List;

public record ParseResponse(
        String name,
        BigDecimal price,
        String brand,
        List<SpecEntryRequest> specs
) {
}
