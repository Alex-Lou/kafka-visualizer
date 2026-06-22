package com.kafkaflow.visualizer.security;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Pose la clé AES-256 utilisée par {@link SaslPasswordConverter} (qui n'est pas un bean Spring).
 * La clé est dérivée du secret applicatif via SHA-256 — réutilise {@code app.jwt-secret}
 * (déjà requis et validé par JwtService), ce qui évite d'ajouter un secret supplémentaire.
 * Compromis assumé : séparation de clés non stricte (acceptable ici, bien meilleur que du plaintext).
 */
@Component
@Slf4j
public class CryptoKeyInitializer {

    @Value("${app.encryption-key:${app.jwt-secret:}}")
    private String secret;

    @PostConstruct
    void init() throws Exception {
        byte[] key = MessageDigest.getInstance("SHA-256")
                .digest((secret == null ? "" : secret).getBytes(StandardCharsets.UTF_8));
        SaslPasswordConverter.setKey(key);
        log.info("Chiffrement au repos du saslPassword initialise");
    }
}
