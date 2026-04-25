package com.aadhaarconnect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "consents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "consent_id")
    private UUID consentId;

    @Column(name = "user_hash", nullable = false)
    private String userHash;

    @Column(name = "client_id", length = 100)
    private String clientId;

    @Column(name = "consented_claims", columnDefinition = "TEXT[]")
    private List<String> consentedClaims;

    @Column(name = "denied_claims", columnDefinition = "TEXT[]")
    private List<String> deniedClaims;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}
