package com.kafkaflow.visualizer.security;

import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * Valide une liste de bootstrap servers Kafka ("host:port,host:port") fournie par l'utilisateur,
 * pour limiter le risque de SSRF.
 *
 * <p>On bloque les adresses <b>link-local / metadata cloud</b> (169.254.0.0/16, dont
 * 169.254.169.254 = endpoint metadata AWS/GCP/Azure), qui ne sont jamais des brokers légitimes.
 * En revanche, loopback (localhost) et adresses privées (RFC1918) restent <b>autorisées</b> :
 * un broker Kafka vit normalement sur un réseau interne — c'est la fonction même de l'outil.
 * Bloquer ces plages casserait l'usage normal.</p>
 */
@Component
public class KafkaAddressValidator {

    public void validate(String bootstrapServers) {
        if (bootstrapServers == null || bootstrapServers.isBlank()) {
            throw new IllegalArgumentException("Les bootstrap servers sont requis");
        }

        for (String raw : bootstrapServers.split(",")) {
            String entry = raw.trim();
            if (entry.isEmpty()) {
                continue;
            }

            int sep = entry.lastIndexOf(':');
            if (sep <= 0 || sep == entry.length() - 1) {
                throw new IllegalArgumentException("Adresse Kafka invalide (attendu host:port) : " + entry);
            }

            String host = entry.substring(0, sep);
            String portStr = entry.substring(sep + 1);

            int port;
            try {
                port = Integer.parseInt(portStr);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Port invalide : " + entry);
            }
            if (port < 1 || port > 65535) {
                throw new IllegalArgumentException("Port hors plage (1-65535) : " + entry);
            }

            rejectMetadataTarget(host);
        }
    }

    private void rejectMetadataTarget(String host) {
        if (host.startsWith("169.254.")) {
            throw new IllegalArgumentException("Adresse non autorisee (link-local/metadata) : " + host);
        }
        // Nom d'hote : resolution best-effort pour bloquer un alias vers le metadata endpoint.
        boolean ipLiteral = host.matches("^\\d{1,3}(\\.\\d{1,3}){3}$") || host.contains(":");
        if (!ipLiteral) {
            try {
                for (InetAddress addr : InetAddress.getAllByName(host)) {
                    if (addr.isLinkLocalAddress()) {
                        throw new IllegalArgumentException(
                                "Hote resolu vers une adresse link-local/metadata : " + host);
                    }
                }
            } catch (UnknownHostException ignored) {
                // Resolution impossible : la connexion Kafka echouera proprement plus tard.
            }
        }
    }
}
