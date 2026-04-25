package com.aadhaarconnect.oidc;

import com.aadhaarconnect.entity.TokenRecord;
import com.aadhaarconnect.oidc.dto.TokenResponse;
import com.aadhaarconnect.repository.TokenRecordRepository;
import com.aadhaarconnect.security.JwtProvider;
import com.aadhaarconnect.service.AuditService;
import com.aadhaarconnect.util.HashUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

/**
 * OIDC service — handles authorization, token exchange with PKCE, and userinfo.
 */
@Service
public class OidcService {

    private static final Logger log = LoggerFactory.getLogger(OidcService.class);

    private final StringRedisTemplate redisTemplate;
    private final JwtProvider jwtProvider;
    private final TokenRecordRepository tokenRecordRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    @Value("${aadhaarconnect.jwt.expiration-seconds}")
    private long jwtExpirationSeconds;

    @Value("${aadhaarconnect.session.ttl-seconds}")
    private long sessionTtl;

    public OidcService(StringRedisTemplate redisTemplate,
                       JwtProvider jwtProvider,
                       TokenRecordRepository tokenRecordRepository,
                       AuditService auditService,
                       ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.jwtProvider = jwtProvider;
        this.tokenRecordRepository = tokenRecordRepository;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    /**
     * Store the authorization request parameters in the user's session (Redis).
     * Called when /oauth/authorize is hit.
     */
    public void storeAuthRequest(String sessionId, String clientId, String redirectUri,
                                  String scope, String state, String codeChallenge) {
        String sessionJson = redisTemplate.opsForValue().get("session:" + sessionId);
        if (sessionJson != null) {
            try {
                Map<String, Object> sessionData = objectMapper.readValue(sessionJson, new TypeReference<>() {});
                sessionData.put("clientId", clientId);
                sessionData.put("redirectUri", redirectUri);
                sessionData.put("scope", scope);
                sessionData.put("state", state);
                sessionData.put("codeChallenge", codeChallenge);

                String updated = objectMapper.writeValueAsString(sessionData);
                redisTemplate.opsForValue().set("session:" + sessionId, updated, sessionTtl, java.util.concurrent.TimeUnit.SECONDS);
            } catch (Exception e) {
                throw new RuntimeException("Failed to update session with auth request", e);
            }
        }
    }

    /**
     * Exchange authorization code for JWT tokens.
     * Validates PKCE code_verifier against stored code_challenge.
     */
    public TokenResponse exchangeToken(String code, String clientId, String redirectUri, String codeVerifier) {
        // Get auth code data from Redis
        String authCodeKey = "auth_code:" + code;
        String authCodeJson = redisTemplate.opsForValue().get(authCodeKey);

        if (authCodeJson == null) {
            throw new RuntimeException("Authorization code expired or invalid");
        }

        // Delete code immediately (single-use)
        redisTemplate.delete(authCodeKey);

        Map<String, Object> authCodeData;
        try {
            authCodeData = objectMapper.readValue(authCodeJson, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse auth code data", e);
        }

        // Validate client_id
        String storedClientId = (String) authCodeData.get("clientId");
        if (!storedClientId.equals(clientId)) {
            throw new RuntimeException("Client ID mismatch");
        }

        // Validate redirect_uri
        String storedRedirectUri = (String) authCodeData.get("redirectUri");
        if (!storedRedirectUri.equals(redirectUri)) {
            throw new RuntimeException("Redirect URI mismatch");
        }

        // Validate PKCE (S256)
        String storedCodeChallenge = (String) authCodeData.get("codeChallenge");
        if (storedCodeChallenge != null && !storedCodeChallenge.isEmpty()) {
            String computedChallenge = computeCodeChallenge(codeVerifier);
            if (!storedCodeChallenge.equals(computedChallenge)) {
                throw new RuntimeException("PKCE verification failed");
            }
        }

        // Get session to retrieve user data and consented claims
        String sessionId = (String) authCodeData.get("sessionId");
        String sessionJson = redisTemplate.opsForValue().get("session:" + sessionId);
        if (sessionJson == null) {
            throw new RuntimeException("Session expired");
        }

        Map<String, Object> sessionData;
        try {
            sessionData = objectMapper.readValue(sessionJson, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse session data", e);
        }

        String userId = (String) sessionData.get("userId");
        String userHash = (String) sessionData.get("userHash");
        @SuppressWarnings("unchecked")
        Map<String, Object> allClaims = (Map<String, Object>) sessionData.get("claims");

        // Filter to only consented claims
        @SuppressWarnings("unchecked")
        List<String> consentedScopes = (List<String>) authCodeData.get("scopes");
        Map<String, Object> filteredClaims = new LinkedHashMap<>();
        if (consentedScopes != null) {
            for (String scope : consentedScopes) {
                if (allClaims.containsKey(scope)) {
                    filteredClaims.put(scope, allClaims.get(scope));
                }
            }
        }

        // Generate pseudonymous pairwise subject identifier
        // RP never gets the real UUID — they get SHA-256(userId + clientId)
        String pairwiseSub = HashUtil.sha256(userId + ":" + clientId);

        // Generate JWT with consented claims only (using pseudonymous sub)
        String token = jwtProvider.generateToken(pairwiseSub, clientId, filteredClaims);

        // Store token record in PostgreSQL
        tokenRecordRepository.save(TokenRecord.builder()
                .tokenHash(HashUtil.sha256(token.substring(token.length() - 20)))
                .clientId(clientId)
                .userHash(userHash)
                .expiresAt(LocalDateTime.now().plusSeconds(jwtExpirationSeconds))
                .build());

        // Delete session from Redis (extra security — RP can't access it)
        redisTemplate.delete("session:" + sessionId);

        // Audit log
        auditService.logEvent("TOKEN_ISSUED", sessionId, userHash, clientId,
                consentedScopes, "SUCCESS");

        log.info("✅ Token issued for pseudonymous subject via client {}", clientId);

        return TokenResponse.builder()
                .accessToken(token)
                .idToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationSeconds)
                .scope(String.join(" ", consentedScopes != null ? consentedScopes : List.of()))
                .build();
    }

    /**
     * Get userinfo — returns only the claims embedded in the JWT.
     */
    public Map<String, Object> getUserInfo(String token) {
        Claims claims = jwtProvider.parseToken(token);

        Map<String, Object> userinfo = new LinkedHashMap<>();
        userinfo.put("sub", claims.getSubject());
        userinfo.put("iss", claims.getIssuer());

        // Return all custom claims (consented only, since that's what was put in the JWT)
        for (Map.Entry<String, Object> entry : claims.entrySet()) {
            String key = entry.getKey();
            if (!Set.of("sub", "iss", "aud", "exp", "iat", "jti").contains(key)) {
                userinfo.put(key, entry.getValue());
            }
        }

        return userinfo;
    }

    /**
     * Compute S256 PKCE code challenge from a code verifier.
     */
    private String computeCodeChallenge(String codeVerifier) {
        if (codeVerifier == null || codeVerifier.isEmpty()) {
            return "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute code challenge", e);
        }
    }
}
