package com.tvshop.dto;

import com.tvshop.domain.OrderStatus;

import java.util.List;

public record OrderUpdateRequest(
        OrderStatus status,
        String fullName,
        String phone,
        String email,
        String address,
        String comment,
        String managerComment,
        List<OrderItemUpdateRequest> items
) {
}
