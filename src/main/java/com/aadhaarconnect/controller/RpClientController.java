package com.aadhaarconnect.controller;

import com.aadhaarconnect.dto.ApiResponse;
import com.aadhaarconnect.entity.RpClient;
import com.aadhaarconnect.repository.RpClientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rp-clients")
public class RpClientController {

    private final RpClientRepository rpClientRepository;

    public RpClientController(RpClientRepository rpClientRepository) {
        this.rpClientRepository = rpClientRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listClients() {
        List<Map<String, Object>> clients = rpClientRepository.findAll().stream()
                .map(rp -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("clientId", rp.getClientId());
                    m.put("clientName", rp.getClientName());
                    m.put("allowedScopes", rp.getAllowedScopes());
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("RP clients", clients));
    }
}
