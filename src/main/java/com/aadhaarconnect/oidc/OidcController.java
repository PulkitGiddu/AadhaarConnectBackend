package com.aadhaarconnect.oidc;

import com.aadhaarconnect.dto.ApiResponse;
import com.aadhaarconnect.oidc.dto.TokenRequest;
import com.aadhaarconnect.oidc.dto.TokenResponse;
import com.aadhaarconnect.repository.RpClientRepository;
import com.aadhaarconnect.entity.RpClient;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * OIDC controller — /oauth/authorize, /oauth/token, /oauth/userinfo
 */
@RestController
public class OidcController {

    private final OidcService oidcService;
    private final RpClientRepository rpClientRepository;

    public OidcController(OidcService oidcService, RpClientRepository rpClientRepository) {
        this.oidcService = oidcService;
        this.rpClientRepository = rpClientRepository;
    }

    /**
     * GET /oauth/authorize
     * Validates client_id and redirect_uri, stores auth request in Redis,
     * returns redirect URL to frontend login page.
     */
    @GetMapping("/oauth/authorize")
    public ResponseEntity<?> authorize(
            @RequestParam("client_id") String clientId,
            @RequestParam("redirect_uri") String redirectUri,
            @RequestParam(value = "response_type", defaultValue = "code") String responseType,
            @RequestParam(value = "scope", defaultValue = "openid") String scope,
            @RequestParam(value = "state", defaultValue = "") String state,
            @RequestParam(value = "code_challenge", defaultValue = "") String codeChallenge,
            @RequestParam(value = "code_challenge_method", defaultValue = "S256") String codeChallengeMethod) {

        // Validate client
        RpClient client = rpClientRepository.findById(clientId).orElse(null);
        if (client == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid client_id"));
        }

        // Validate redirect URI
        if (!client.isValidRedirectUri(redirectUri)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid redirect_uri"));
        }

        // Return auth params for the frontend to use during the flow
        Map<String, String> authParams = Map.of(
                "clientId", clientId,
                "redirectUri", redirectUri,
                "scope", scope,
                "state", state,
                "codeChallenge", codeChallenge,
                "loginUrl", "http://localhost:5173/login?client_id=" + clientId +
                        "&redirect_uri=" + redirectUri +
                        "&scope=" + scope +
                        "&state=" + state +
                        "&code_challenge=" + codeChallenge
        );

        return ResponseEntity.ok(ApiResponse.ok("Authorization request validated", authParams));
    }

    /**
     * POST /oauth/authorize/session
     * After OTP verification, attach OIDC auth request params to the session.
     */
    @PostMapping("/oauth/authorize/session")
    public ResponseEntity<ApiResponse<Void>> attachAuthToSession(@RequestBody Map<String, String> request) {
        try {
            oidcService.storeAuthRequest(
                    request.get("sessionId"),
                    request.get("clientId"),
                    request.get("redirectUri"),
                    request.get("scope"),
                    request.get("state"),
                    request.get("codeChallenge")
            );
            return ResponseEntity.ok(ApiResponse.ok("Auth request attached to session"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /oauth/token
     * Exchanges authorization code for JWT tokens.
     * Supports PKCE code_verifier validation.
     */
    @PostMapping("/oauth/token")
    public ResponseEntity<?> token(@RequestBody TokenRequest request) {
        try {
            TokenResponse response = oidcService.exchangeToken(
                    request.getCode(),
                    request.getClientId(),
                    request.getRedirectUri(),
                    request.getCodeVerifier()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /oauth/userinfo
     * Returns consented claims from the validated JWT.
     * Requires Bearer token authentication.
     */
    @GetMapping("/oauth/userinfo")
    public ResponseEntity<?> userinfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getCredentials() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }

        try {
            String token = (String) auth.getCredentials();
            Map<String, Object> userinfo = oidcService.getUserInfo(token);
            return ResponseEntity.ok(userinfo);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid token"));
        }
    }
}
