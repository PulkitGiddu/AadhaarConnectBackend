package com.aadhaarconnect.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class OtpRequest {
    @NotBlank(message = "Aadhaar number is required")
    @Pattern(regexp = "^[0-9]{12}$", message = "Invalid Aadhaar number. Must be 12 digits.")
    private String aadhaarNumber;
}
