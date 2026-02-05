package com.kafkaflow.visualizer.runner;

import com.kafkaflow.visualizer.model.User; // Adapte selon ton modèle User
import com.kafkaflow.visualizer.repository.UserRepository; // Adapte selon ton Repo
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OwnerSetupRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment env;
    private final ApplicationContext context;

    @Override
    public void run(String... args) throws Exception {
        // On vérifie si le mode "setup-owner" est activé via les arguments
        String setupMode = env.getProperty("app.setup.mode");

        if (!"true".equals(setupMode)) {
            return; // Si ce n'est pas le mode setup, on ne fait rien, l'app démarre normalement
        }

        log.info("════════════════════════════════════════════════════════════");
        log.info("           OWNER ACCOUNT CREATION WIZARD                ");
        log.info("════════════════════════════════════════════════════════════");

        String username = env.getProperty("app.setup.username");
        String password = env.getProperty("app.setup.password");
        String email = env.getProperty("app.setup.email");

        if (username == null || password == null) {
            log.error("❌ Missing credentials. Please use the setup script.");
            shutdown();
            return;
        }

        try {
            if (userRepository.existsByUsername(username)) {
                log.warn("⚠ User '{}' already exists. Skipping creation.", username);
            } else {
                User owner = new User();
                owner.setUsername(username);
                owner.setEmail(email != null ? email : username + "@admin.com"); // Email par défaut si vide
                owner.setPassword(passwordEncoder.encode(password)); // Hachage sécurisé
                // Adapte ici selon comment tu gères tes rôles (String, Enum, ou Table à part)
                // Exemple simple :
                owner.setRole("OWNER");
                // ou owner.setRoles(Set.of(Role.OWNER));

                userRepository.save(owner);
                log.info("✅ SUCCESS: Owner account '{}' created with 'OWNER' privileges.", username);
            }
        } catch (Exception e) {
            log.error("❌ ERROR: Could not create user.", e);
        }

        log.info("════════════════════════════════════════════════════════════");
        log.info("Exiting setup mode...");
        shutdown();
    }

    private void shutdown() {
        SpringApplication.exit(context, () -> 0);
        System.exit(0);
    }
}