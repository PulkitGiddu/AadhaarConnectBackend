package com.aadhaarconnect.controller;

import com.aadhaarconnect.dto.ApiResponse;
import com.aadhaarconnect.entity.AuditLog;
import com.aadhaarconnect.entity.Consent;
import com.aadhaarconnect.entity.RpClient;
import com.aadhaarconnect.entity.TokenRecord;
import com.aadhaarconnect.repository.AuditLogRepository;
import com.aadhaarconnect.repository.ConsentRepository;
import com.aadhaarconnect.repository.RpClientRepository;
import com.aadhaarconnect.repository.TokenRecordRepository;
import com.aadhaarconnect.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * User management controller — dashboard data, consent management, revoke access.
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final ConsentRepository consentRepository;
    private final RpClientRepository rpClientRepository;
    private final AuditLogRepository auditLogRepository;
    private final TokenRecordRepository tokenRecordRepository;
    private final AuditService auditService;

    public UserController(ConsentRepository consentRepository,
                          RpClientRepository rpClientRepository,
                          AuditLogRepository auditLogRepository,
                          TokenRecordRepository tokenRecordRepository,
                          AuditService auditService) {
        this.consentRepository = consentRepository;
        this.rpClientRepository = rpClientRepository;
        this.auditLogRepository = auditLogRepository;
        this.tokenRecordRepository = tokenRecordRepository;
        this.auditService = auditService;
    }

    /**
     * GET /api/user/consents?userHash=...
     * Returns all active consents for a user with RP details.
     */
    @GetMapping("/consents")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getConsents(
            @RequestParam("userHash") String userHash) {
        List<Consent> consents = consentRepository.findAllByUserHash(userHash);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Consent consent : consents) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("consentId", consent.getConsentId().toString());
            entry.put("clientId", consent.getClientId());
            entry.put("consentedClaims", consent.getConsentedClaims());
            entry.put("deniedClaims", consent.getDeniedClaims());
            entry.put("createdAt", consent.getCreatedAt() != null ? consent.getCreatedAt().toString() : null);

            // Fetch RP client details
            rpClientRepository.findById(consent.getClientId()).ifPresent(rp -> {
                entry.put("clientName", rp.getClientName());
                entry.put("allowedScopes", rp.getAllowedScopes());
            });

            result.add(entry);
        }

        return ResponseEntity.ok(ApiResponse.ok("User consents retrieved", result));
    }

    /**
     * POST /api/user/revoke
     * Revokes access for a specific RP client — deletes consent and marks tokens as revoked.
     */
    @PostMapping("/revoke")
    public ResponseEntity<ApiResponse<Void>> revokeAccess(@RequestBody Map<String, String> request) {
        String userHash = request.get("userHash");
        String clientId = request.get("clientId");

        if (userHash == null || clientId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("userHash and clientId are required"));
        }

        // Delete consent
        Optional<Consent> consent = consentRepository.findByUserHashAndClientId(userHash, clientId);
        consent.ifPresent(consentRepository::delete);

        // Mark all tokens for this user+client as revoked
        List<TokenRecord> tokens = tokenRecordRepository.findByUserHashAndClientId(userHash, clientId);
        for (TokenRecord token : tokens) {
            token.setRevoked(true);
        }
        tokenRecordRepository.saveAll(tokens);

        // Audit log
        auditService.logEvent("ACCESS_REVOKED", null, userHash, clientId, null, "SUCCESS");

        return ResponseEntity.ok(ApiResponse.ok("Access revoked for " + clientId));
    }

    /**
     * GET /api/user/audit?userHash=...
     * Returns recent audit events for the user.
     */
    @GetMapping("/audit")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAuditLogs(
            @RequestParam("userHash") String userHash) {
        List<AuditLog> logs = auditLogRepository.findByUserHashOrderByCreatedAtDesc(userHash);
        List<Map<String, Object>> result = logs.stream()
                .limit(50)
                .map(log -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("eventId", log.getEventId().toString());
                    entry.put("eventType", log.getEventType());
                    entry.put("sessionId", log.getSessionId());
                    entry.put("clientId", log.getClientId());
                    entry.put("claims", log.getClaims());
                    entry.put("outcome", log.getOutcome());
                    entry.put("createdAt", log.getCreatedAt() != null ? log.getCreatedAt().toString() : null);
                    return entry;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Audit logs retrieved", result));
    }

    /**
     * GET /api/user/stats?userHash=...
     * Returns dashboard stats.
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            @RequestParam("userHash") String userHash) {
        List<AuditLog> logs = auditLogRepository.findByUserHashOrderByCreatedAtDesc(userHash);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalEvents", logs.size());
        stats.put("activeConsents", consentRepository.findAllByUserHash(userHash).size());

        // Last event recency
        if (!logs.isEmpty()) {
            stats.put("lastEventTime", logs.get(0).getCreatedAt().toString());
        }

        // Count by type
        Map<String, Long> eventCounts = logs.stream()
                .collect(Collectors.groupingBy(AuditLog::getEventType, Collectors.counting()));
        stats.put("eventCounts", eventCounts);

        return ResponseEntity.ok(ApiResponse.ok("Dashboard stats", stats));
    }
}
