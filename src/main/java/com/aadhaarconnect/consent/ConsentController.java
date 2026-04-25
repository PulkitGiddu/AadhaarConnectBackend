package com.aadhaarconnect.consent;

import com.aadhaarconnect.consent.dto.ConsentRequest;
import com.aadhaarconnect.consent.dto.ConsentResponse;
import com.aadhaarconnect.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Consent controller — handles user consent submission.
 */
@RestController
@RequestMapping("/api")
public class ConsentController {

    private final ConsentService consentService;

    public ConsentController(ConsentService consentService) {
        this.consentService = consentService;
    }

    /**
     * POST /api/consent
     * Stores consent, generates authorization code, returns redirect info.
     */
    @PostMapping("/consent")
    public ResponseEntity<ApiResponse<ConsentResponse>> submitConsent(@Valid @RequestBody ConsentRequest request) {
        try {
            ConsentResponse response = consentService.processConsent(
                    request.getSessionId(),
                    request.getConsentedClaims(),
                    request.getDeniedClaims()
            );
            return ResponseEntity.ok(ApiResponse.ok("Consent processed successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
