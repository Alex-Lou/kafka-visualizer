package com.kafkaflow.visualizer.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Chiffre/déchiffre le {@code saslPassword} au repos (AES-256-GCM).
 * La clé est posée au démarrage par {@link CryptoKeyInitializer}.
 *
 * <p>Tolérant : valeurs nulles/vides ou "legacy" (non préfixées {@code enc:}) passent telles
 * quelles — aucune donnée existante n'est cassée. En lecture, une donnée illisible (clé changée /
 * corruption) renvoie {@code null} plutôt que de faire échouer le chargement de l'entité.</p>
 */
@Converter
public class SaslPasswordConverter implements AttributeConverter<String, String> {

    private static final String PREFIX = "enc:";
    private static final int IV_LEN = 12;
    private static final int TAG_BITS = 128;

    private static volatile byte[] keyBytes; // 32 octets, posé par CryptoKeyInitializer

    static void setKey(byte[] key) {
        keyBytes = key;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isEmpty() || keyBytes == null) {
            return attribute;
        }
        try {
            byte[] iv = new byte[IV_LEN];
            new SecureRandom().nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(keyBytes, "AES"),
                    new GCMParameterSpec(TAG_BITS, iv));
            byte[] ct = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));
            byte[] out = new byte[iv.length + ct.length];
            System.arraycopy(iv, 0, out, 0, iv.length);
            System.arraycopy(ct, 0, out, iv.length, ct.length);
            return PREFIX + Base64.getEncoder().encodeToString(out);
        } catch (Exception e) {
            throw new IllegalStateException("Echec du chiffrement saslPassword", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty() || keyBytes == null || !dbData.startsWith(PREFIX)) {
            return dbData; // null/vide ou legacy plaintext : on renvoie tel quel
        }
        try {
            byte[] all = Base64.getDecoder().decode(dbData.substring(PREFIX.length()));
            byte[] iv = new byte[IV_LEN];
            System.arraycopy(all, 0, iv, 0, IV_LEN);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(keyBytes, "AES"),
                    new GCMParameterSpec(TAG_BITS, iv));
            byte[] pt = cipher.doFinal(all, IV_LEN, all.length - IV_LEN);
            return new String(pt, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return null; // illisible : ne pas faire planter le chargement
        }
    }
}
