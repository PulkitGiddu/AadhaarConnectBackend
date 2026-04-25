package com.aadhaarconnect.oidc.dto;

import lombok.Data;

@Data
public class TokenRequest {
    private String grantType;
    private String code;
    private String redirectUri;
    private String clientId;
    private String clientSecret;
    private String codeVerifier;
}
