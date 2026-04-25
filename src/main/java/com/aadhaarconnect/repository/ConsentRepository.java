package com.aadhaarconnect.repository;

import com.aadhaarconnect.entity.Consent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsentRepository extends JpaRepository<Consent, UUID> {
    Optional<Consent> findByUserHashAndClientId(String userHash, String clientId);
    List<Consent> findAllByUserHash(String userHash);
}
