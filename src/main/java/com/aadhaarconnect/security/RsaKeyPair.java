package com.aadhaarconnect.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

/**
 * Generates an RSA-2048 keypair at startup and holds it in memory.
 * Note: Keys rotate on every restart — fine for demo, production would use a persisted keystore.
 */
@Component
public class RsaKeyPair {

    private static final Logger log = LoggerFactory.getLogger(RsaKeyPair.class);

    private final RSAPublicKey publicKey;
    private final RSAPrivateKey privateKey;

    public RsaKeyPair() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            KeyPair keyPair = generator.generateKeyPair();
            this.publicKey = (RSAPublicKey) keyPair.getPublic();
            this.privateKey = (RSAPrivateKey) keyPair.getPrivate();
            log.info("✅ RSA-2048 keypair generated at startup");
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate RSA keypair", e);
        }
    }

    public RSAPublicKey getPublicKey() {
        return publicKey;
    }

    public RSAPrivateKey getPrivateKey() {
        return privateKey;
    }
}
