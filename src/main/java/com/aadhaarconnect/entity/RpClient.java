package com.aadhaarconnect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "rp_clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RpClient {

    @Id
    @Column(name = "client_id", length = 100)
    private String clientId;

    @Column(name = "client_secret", nullable = false)
    private String clientSecret;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column(name = "redirect_uris", columnDefinition = "TEXT[]")
    private List<String> redirectUris;

    @Column(name = "allowed_scopes", columnDefinition = "TEXT[]")
    private List<String> allowedScopes;

    @Column(name = "sector_identifier")
    private String sectorIdentifier;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    /**
     * Check if a given redirect URI is registered for this client.
     */
    public boolean isValidRedirectUri(String uri) {
        return redirectUris != null && redirectUris.contains(uri);
    }
}
