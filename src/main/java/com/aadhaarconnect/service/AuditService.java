package com.aadhaarconnect.service;

import com.aadhaarconnect.entity.AuditLog;
import com.aadhaarconnect.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Audit logging service — records all critical events to PostgreSQL.
 */
@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logEvent(String eventType, String sessionId, String userHash,
                         String clientId, List<String> claims, String outcome) {
        AuditLog auditLog = AuditLog.builder()
                .eventType(eventType)
                .sessionId(sessionId)
                .userHash(userHash)
                .clientId(clientId)
                .claims(claims)
                .outcome(outcome)
                .build();

        auditLogRepository.save(auditLog);
        log.info("📋 Audit: {} | session={} | user={} | outcome={}", eventType, sessionId, userHash, outcome);
    }
}
