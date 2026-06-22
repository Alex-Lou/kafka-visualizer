package com.kafkaflow.visualizer.config;

import com.kafkaflow.visualizer.security.JwtAccessDeniedHandler;
import com.kafkaflow.visualizer.security.JwtAuthEntryPoint;
import com.kafkaflow.visualizer.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // active @PreAuthorize (autorisation par role, lot suivant)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // API stateless avec JWT Bearer : pas de session, CSRF non applicable
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public : login + health + handshake WebSocket (auth WS au CONNECT STOMP)
                        .requestMatchers("/api/auth/login", "/actuator/health", "/ws/**").permitAll()
                        // Administration : gestion des comptes + nettoyage = OWNER
                        .requestMatchers("/api/users/**", "/api/cleanup/**").hasRole("OWNER")
                        // Toute suppression / modification = OWNER (destructif ou structurel)
                        .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("OWNER")
                        .requestMatchers(HttpMethod.PUT, "/api/**").hasRole("OWNER")
                        // Créations/actions structurelles ou destructrices (POST) = OWNER
                        .requestMatchers(HttpMethod.POST,
                                "/api/connections", "/api/connections/test-error",
                                "/api/topics/connection/**",
                                "/api/retention/**"
                        ).hasRole("OWNER")
                        // Reste : tout utilisateur authentifié (lectures, rapports, flows...)
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthEntryPoint)   // 401 : non authentifié
                        .accessDeniedHandler(jwtAccessDeniedHandler))  // 403 : rôle insuffisant
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
