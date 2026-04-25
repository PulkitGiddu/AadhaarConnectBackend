package com.aadhaarconnect.consent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ConsentRequest {
    @NotBlank(message = "Session ID is required")
    private String sessionId;

    @NotNull(message = "Consented claims are required")
    private List<String> consentedClaims;

    private List<String> deniedClaims;
}
