package com.aadhaarconnect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "event_id")
    private UUID eventId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "user_hash")
    private String userHash;

    @Column(name = "client_id", length = 100)
    private String clientId;

    @Column(name = "claims", columnDefinition = "TEXT[]")
    private List<String> claims;

    @Column(name = "ip_hash")
    private String ipHash;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "outcome", nullable = false, length = 50)
    private String outcome;
}
