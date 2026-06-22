package com.kafkaflow.visualizer.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Génération et validation des JWT (HS256).
 * Le secret provient de {@code app.jwt-secret} (variable d'env JWT_SECRET).
 * Fail-fast au démarrage si le secret est absent, par défaut ou trop court.
 */
@Service
@Slf4j
public class JwtService {

    private final String secret;
    private final long expirationMs;
    private SecretKey key;

    public JwtService(
            @Value("${app.jwt-secret:}") String secret,
            @Value("${app.jwt-expiration-ms:86400000}") long expirationMs) {
        this.secret = secret;
        this.expirationMs = expirationMs;
    }

    @PostConstruct
    void init() {
        if (secret == null
                || secret.isBlank()
                || "change-me-in-production".equals(secret)
                || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT secret invalide. Definis 'app.jwt-secret' (env JWT_SECRET) avec une valeur " +
                    "d'au moins 32 octets. Genere-la avec: openssl rand -base64 32");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        log.info("JwtService initialise (expiration: {} ms)", expirationMs);
    }

    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    /** Retourne les claims si le token est valide et non expiré, sinon {@code null}. */
    public Claims parse(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
