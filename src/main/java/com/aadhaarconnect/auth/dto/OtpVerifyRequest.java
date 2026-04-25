package com.aadhaarconnect.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerifyRequest {
    @NotBlank(message = "Aadhaar number is required")
    private String aadhaarNumber;

    @NotBlank(message = "OTP is required")
    private String otp;
}
