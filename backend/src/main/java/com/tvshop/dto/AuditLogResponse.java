package com.tvshop.dto;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        String actor,
        String action,
        String entity,
        Long entityId,
        String detail,
        LocalDateTime createdAt
) {
}
