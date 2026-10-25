package com.tvshop.dto;

import com.tvshop.domain.OrderStatus;

public record OrderUpdateRequest(
        OrderStatus status,
        String fullName,
        String phone,
        String email,
        String address,
        String comment
) {
}
