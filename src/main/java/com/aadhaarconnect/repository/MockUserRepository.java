package com.aadhaarconnect.repository;

import com.aadhaarconnect.entity.MockUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MockUserRepository extends JpaRepository<MockUser, UUID> {
    Optional<MockUser> findByAadhaarNumber(String aadhaarNumber);
}
