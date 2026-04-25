package com.aadhaarconnect.repository;

import com.aadhaarconnect.entity.RpClient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RpClientRepository extends JpaRepository<RpClient, String> {
}
