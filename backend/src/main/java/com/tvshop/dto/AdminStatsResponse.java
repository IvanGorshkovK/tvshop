package com.tvshop.dto;

import java.math.BigDecimal;

public record AdminStatsResponse(
        long products,
        long orders,
        BigDecimal revenue,
        long users
) {
}
