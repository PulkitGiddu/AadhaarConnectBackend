package com.aadhaarconnect.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

/**
 * JWT provider for RS256 token signing and verification.
 */
@Component
public class JwtProvider {

    private final RsaKeyPair rsaKeyPair;

    @Value("${aadhaarconnect.jwt.issuer}")
    private String issuer;

    @Value("${aadhaarconnect.jwt.expiration-seconds}")
    private long expirationSeconds;

    public JwtProvider(RsaKeyPair rsaKeyPair) {
        this.rsaKeyPair = rsaKeyPair;
    }

    /**
     * Generate a signed JWT with RS256 containing only the consented claims.
     */
    public String generateToken(String subject, String audience, Map<String, Object> claims) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(expirationSeconds);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(subject)
                .issuer(issuer)
                .audience().add(audience).and()
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claims(claims)
                .signWith(rsaKeyPair.getPrivateKey(), Jwts.SIG.RS256)
                .compact();
    }

    /**
     * Parse and validate a JWT token. Returns claims if valid, throws on failure.
     */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(rsaKeyPair.getPublicKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Validate a token and return true if valid.
     */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public RsaKeyPair getRsaKeyPair() {
        return rsaKeyPair;
    }
}
