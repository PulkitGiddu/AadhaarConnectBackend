package com.aadhaarconnect.auth;

import com.aadhaarconnect.auth.dto.AuthResponse;
import com.aadhaarconnect.auth.dto.OtpRequest;
import com.aadhaarconnect.auth.dto.OtpVerifyRequest;
import com.aadhaarconnect.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Auth controller — exposes OTP endpoints for mock UIDAI verification via Aadhaar number.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /auth/send-otp
     * Input: { aadhaarNumber: "123456789012" }
     * Generates mock OTP (123456), stores in Redis with TTL.
     * In production, UIDAI would send OTP to the registered mobile.
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody OtpRequest request) {
        try {
            authService.sendOtp(request.getAadhaarNumber());
            return ResponseEntity.ok(ApiResponse.ok("OTP sent successfully to registered mobile. Use 123456 for demo."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /auth/verify-otp
     * Input: { aadhaarNumber: "123456789012", otp: "123456" }
     * Validates OTP, creates session in Redis, returns available claims.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        try {
            AuthResponse response = authService.verifyOtp(request.getAadhaarNumber(), request.getOtp());
            return ResponseEntity.ok(ApiResponse.ok("OTP verified successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
