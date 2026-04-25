package com.aadhaarconnect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mock_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockUser {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "aadhaar_number", nullable = false, unique = true, length = 12)
    private String aadhaarNumber;

    @Column(name = "mobile", length = 15)
    private String mobile;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "aadhaar_hash", nullable = false)
    private String aadhaarHash;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Privacy-first: derive age_over_18 instead of exposing raw DOB.
     */
    public boolean isAgeOver18() {
        return LocalDate.now().minusYears(18).isAfter(dateOfBirth) ||
               LocalDate.now().minusYears(18).isEqual(dateOfBirth);
    }
}
