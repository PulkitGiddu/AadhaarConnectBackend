package com.aadhaarconnect.oidc;

import com.aadhaarconnect.security.RsaKeyPair;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * JWKS endpoint — exposes the RSA public key in JWK format.
 * GET /.well-known/jwks.json
 */
@RestController
public class JwksController {

    private final RsaKeyPair rsaKeyPair;

    public JwksController(RsaKeyPair rsaKeyPair) {
        this.rsaKeyPair = rsaKeyPair;
    }

    @GetMapping("/.well-known/jwks.json")
    public Map<String, Object> jwks() {
        RSAPublicKey publicKey = rsaKeyPair.getPublicKey();

        Map<String, Object> jwk = Map.of(
                "kty", "RSA",
                "alg", "RS256",
                "use", "sig",
                "kid", "aadhaarconnect-key-1",
                "n", Base64.getUrlEncoder().withoutPadding()
                        .encodeToString(publicKey.getModulus().toByteArray()),
                "e", Base64.getUrlEncoder().withoutPadding()
                        .encodeToString(publicKey.getPublicExponent().toByteArray())
        );

        return Map.of("keys", List.of(jwk));
    }
}
