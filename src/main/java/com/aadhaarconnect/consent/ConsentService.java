package com.aadhaarconnect.consent;

import com.aadhaarconnect.consent.dto.ConsentResponse;
import com.aadhaarconnect.entity.Consent;
import com.aadhaarconnect.repository.ConsentRepository;
import com.aadhaarconnect.service.AuditService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Consent service — stores consent in PostgreSQL, generates authorization code in Redis.
 */
@Service
public class ConsentService {

    private static final Logger log = LoggerFactory.getLogger(ConsentService.class);

    private final StringRedisTemplate redisTemplate;
    private final ConsentRepository consentRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    @Value("${aadhaarconnect.auth-code.ttl-seconds}")
    private long authCodeTtl;

    public ConsentService(StringRedisTemplate redisTemplate,
                          ConsentRepository consentRepository,
                          AuditService auditService,
                          ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.consentRepository = consentRepository;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    /**
     * Process consent: store in PostgreSQL, generate auth code, store in Redis.
     */
    public ConsentResponse processConsent(String sessionId, List<String> consentedClaims, List<String> deniedClaims) {
        // Retrieve session from Redis
        String sessionJson = redisTemplate.opsForValue().get("session:" + sessionId);
        if (sessionJson == null) {
            throw new RuntimeException("Session expired or invalid");
        }

        Map<String, Object> sessionData;
        try {
            sessionData = objectMapper.readValue(sessionJson, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse session data", e);
        }

        String userHash = (String) sessionData.get("userHash");

        // Read the stored OIDC auth request from session (if exists)
        String clientId = (String) sessionData.getOrDefault("clientId", "groww");
        String redirectUri = (String) sessionData.getOrDefault("redirectUri", "http://localhost:5173/callback");
        String state = (String) sessionData.getOrDefault("state", "");
        String codeChallenge = (String) sessionData.getOrDefault("codeChallenge", "");

        // Store consent in PostgreSQL
        Optional<Consent> existing = consentRepository.findByUserHashAndClientId(userHash, clientId);
        Consent consent;
        if (existing.isPresent()) {
            consent = existing.get();
            consent.setConsentedClaims(consentedClaims);
            consent.setDeniedClaims(deniedClaims != null ? deniedClaims : List.of());
        } else {
            consent = Consent.builder()
                    .userHash(userHash)
                    .clientId(clientId)
                    .consentedClaims(consentedClaims)
                    .deniedClaims(deniedClaims != null ? deniedClaims : List.of())
                    .build();
        }
        consentRepository.save(consent);

        // Generate authorization code
        String authCode = UUID.randomUUID().toString();

        // Store auth code in Redis
        Map<String, Object> authCodeData = new LinkedHashMap<>();
        authCodeData.put("sessionId", sessionId);
        authCodeData.put("scopes", consentedClaims);
        authCodeData.put("codeChallenge", codeChallenge);
        authCodeData.put("clientId", clientId);
        authCodeData.put("redirectUri", redirectUri);

        try {
            String authCodeJson = objectMapper.writeValueAsString(authCodeData);
            redisTemplate.opsForValue().set("auth_code:" + authCode, authCodeJson, authCodeTtl, TimeUnit.SECONDS);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store auth code", e);
        }

        // Audit log
        auditService.logEvent("CONSENT_GIVEN", sessionId, userHash, clientId, consentedClaims, "SUCCESS");

        log.info("✅ Consent processed for session {} — auth code: {}", sessionId, authCode);

        return ConsentResponse.builder()
                .authorizationCode(authCode)
                .redirectUri(redirectUri)
                .state(state)
                .build();
    }
}
