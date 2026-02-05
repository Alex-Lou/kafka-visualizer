package com.kafkaflow.visualizer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // C'est ce Bean qui manquait et causait l'erreur
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // Désactive CSRF pour simplifier les API calls
                .cors(cors -> {}) // Active la config CORS définie ailleurs
                .authorizeHttpRequests(auth -> auth
                        // Pour l'instant, on laisse tout ouvert pour ne pas bloquer ton dev
                        // On sécurisera les routes plus tard quand le login sera prêt
                        .requestMatchers("/**").permitAll()
                );

        return http.build();
    }
}