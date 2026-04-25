package com.aadhaarconnect.repository;

import com.aadhaarconnect.entity.TokenRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TokenRecordRepository extends JpaRepository<TokenRecord, UUID> {
    List<TokenRecord> findByUserHashAndClientId(String userHash, String clientId);
}
