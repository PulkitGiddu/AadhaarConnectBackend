package com.aadhaarconnect.consent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsentResponse {
    private String authorizationCode;
    private String redirectUri;
    private String state;
}
