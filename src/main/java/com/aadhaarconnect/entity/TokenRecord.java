package com.aadhaarconnect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "token_id")
    private UUID tokenId;

    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @Column(name = "client_id", length = 100)
    private String clientId;

    @Column(name = "user_hash", nullable = false)
    private String userHash;

    @Column(name = "issued_at")
    @Builder.Default
    private LocalDateTime issuedAt = LocalDateTime.now();

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked")
    @Builder.Default
    private Boolean revoked = false;
}
