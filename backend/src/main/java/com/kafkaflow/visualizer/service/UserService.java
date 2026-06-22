package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.dto.UserDto.*;
import com.kafkaflow.visualizer.model.User;
import com.kafkaflow.visualizer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Set<String> ALLOWED_ROLES = Set.of("OWNER", "ADMIN", "VIEWER", "USER");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // Anti-escalade : on n'accepte qu'un role connu, sinon USER par defaut.
        String requested = request.getRole() == null ? "USER" : request.getRole().trim().toUpperCase();
        user.setRole(ALLOWED_ROLES.contains(requested) ? requested : "USER");

        return mapToResponse(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Garde-fou : ne jamais supprimer le dernier OWNER (verrouillage du compte).
        if ("OWNER".equalsIgnoreCase(user.getRole())) {
            long owners = userRepository.findAll().stream()
                    .filter(u -> "OWNER".equalsIgnoreCase(u.getRole()))
                    .count();
            if (owners <= 1) {
                throw new RuntimeException("Impossible de supprimer le dernier compte OWNER");
            }
        }

        userRepository.deleteById(id);
    }

    // Convertisseur Helper
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}