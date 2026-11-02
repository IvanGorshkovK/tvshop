package com.tvshop.service;

import com.tvshop.domain.AuditLog;
import com.tvshop.dto.AuditLogResponse;
import com.tvshop.repository.AuditLogRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(String actor, String action, String entity, Long entityId, String detail) {
        AuditLog l = new AuditLog();
        l.setActor(actor);
        l.setAction(action);
        l.setEntity(entity);
        l.setEntityId(entityId);
        l.setDetail(detail != null && detail.length() > 490 ? detail.substring(0, 490) : detail);
        auditLogRepository.save(l);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> list() {
        return auditLogRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .limit(500)
                .map(l -> new AuditLogResponse(
                        l.getId(),
                        l.getActor(),
                        l.getAction(),
                        l.getEntity(),
                        l.getEntityId(),
                        l.getDetail(),
                        l.getCreatedAt()))
                .toList();
    }
}
