package com.aadhaarconnect.auth;

import com.aadhaarconnect.auth.dto.AuthResponse;
import com.aadhaarconnect.entity.MockUser;
import com.aadhaarconnect.repository.MockUserRepository;
import com.aadhaarconnect.service.AuditService;
import com.aadhaarconnect.util.HashUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Auth service — handles mock UIDAI OTP flow with Redis-backed ephemeral storage.
 * Users authenticate using their 12-digit Aadhaar number.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final String DEMO_OTP = "123456";

    private final StringRedisTemplate redisTemplate;
    private final MockUserRepository userRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    @Value("${aadhaarconnect.otp.ttl-seconds}")
    private long otpTtl;

    @Value("${aadhaarconnect.otp.max-attempts}")
    private int maxAttempts;

    @Value("${aadhaarconnect.otp.rate-limit-ttl-seconds}")
    private long rateLimitTtl;

    @Value("${aadhaarconnect.session.ttl-seconds}")
    private long sessionTtl;

    public AuthService(StringRedisTemplate redisTemplate,
                       MockUserRepository userRepository,
                       AuditService auditService,
                       ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    /**
     * Send OTP for the given Aadhaar number (mock — always 123456).
     * In production, UIDAI sends OTP to the registered mobile linked to this Aadhaar.
     * Rate-limited: max 5 attempts per 15 minutes.
     */
    public void sendOtp(String aadhaarNumber) {
        // Rate limit check
        String rateLimitKey = "otp_attempts:" + HashUtil.sha256(aadhaarNumber);
        String attempts = redisTemplate.opsForValue().get(rateLimitKey);
        int currentAttempts = attempts != null ? Integer.parseInt(attempts) : 0;

        if (currentAttempts >= maxAttempts) {
            throw new RuntimeException("Rate limit exceeded. Try again after 15 minutes.");
        }

        // Verify Aadhaar number exists in our mock database
        userRepository.findByAadhaarNumber(aadhaarNumber)
                .orElseThrow(() -> new RuntimeException("Aadhaar number not registered"));

        // Store OTP in Redis (keyed by hashed Aadhaar for privacy)
        String otpKey = "otp:" + HashUtil.sha256(aadhaarNumber);
        redisTemplate.opsForValue().set(otpKey, DEMO_OTP, otpTtl, TimeUnit.SECONDS);

        // Increment rate limit counter
        redisTemplate.opsForValue().increment(rateLimitKey);
        if (currentAttempts == 0) {
            redisTemplate.expire(rateLimitKey, rateLimitTtl, TimeUnit.SECONDS);
        }

        // Audit log (using hashed Aadhaar — never store raw)
        auditService.logEvent("OTP_SENT", null, HashUtil.sha256(aadhaarNumber), null, null, "SUCCESS");

        String maskedAadhaar = "XXXX-XXXX-" + aadhaarNumber.substring(8);
        log.info("📱 OTP sent for Aadhaar {} (demo OTP: {})", maskedAadhaar, DEMO_OTP);
    }

    /**
     * Verify OTP and create a session in Redis.
     * Returns session data with available claims for the consent page.
     */
    public AuthResponse verifyOtp(String aadhaarNumber, String otp) {
        String hashedAadhaar = HashUtil.sha256(aadhaarNumber);

        // Get stored OTP from Redis
        String otpKey = "otp:" + hashedAadhaar;
        String storedOtp = redisTemplate.opsForValue().get(otpKey);

        if (storedOtp == null) {
            throw new RuntimeException("OTP expired or not found. Please request a new OTP.");
        }

        if (!storedOtp.equals(otp)) {
            auditService.logEvent("OTP_VERIFIED", null, hashedAadhaar, null, null, "FAILED");
            throw new RuntimeException("Invalid OTP");
        }

        // OTP valid — delete it (single-use)
        redisTemplate.delete(otpKey);

        // Fetch user from DB by Aadhaar number
        MockUser user = userRepository.findByAadhaarNumber(aadhaarNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Derive claims (privacy-first — no raw DOB, no raw Aadhaar)
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("name", user.getFullName());
        claims.put("age_over_18", user.isAgeOver18());
        claims.put("state", user.getState());
        claims.put("gender", user.getGender());

        // Create session in Redis
        String sessionId = UUID.randomUUID().toString();
        Map<String, Object> sessionData = new LinkedHashMap<>();
        sessionData.put("userId", user.getUserId().toString());
        sessionData.put("userHash", HashUtil.sha256(user.getUserId().toString()));
        sessionData.put("claims", claims);

        try {
            String sessionJson = objectMapper.writeValueAsString(sessionData);
            redisTemplate.opsForValue().set("session:" + sessionId, sessionJson, sessionTtl, TimeUnit.SECONDS);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize session data", e);
        }

        // Audit log
        auditService.logEvent("OTP_VERIFIED", sessionId, hashedAadhaar, null, null, "SUCCESS");

        String maskedAadhaar = "XXXX-XXXX-" + aadhaarNumber.substring(8);
        log.info(" OTP verified for Aadhaar {} — session {}", maskedAadhaar, sessionId);

        String userHash = HashUtil.sha256(user.getUserId().toString());

        return AuthResponse.builder()
                .sessionId(sessionId)
                .userName(user.getFullName())
                .userHash(userHash)
                .availableClaims(claims)
                .build();
    }
}
