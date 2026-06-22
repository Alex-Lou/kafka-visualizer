package com.kafkaflow.visualizer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

public class UserDto {

    @Data
    @Builder
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private String role;
    }

    @Data
    @Builder
    public static class UpdateProfileRequest {
        private String email;
        private String currentPassword;
        private String newPassword;
    }

    @Data
    @Builder
    public static class CreateUserRequest {
        @NotBlank(message = "Username requis")
        @Size(min = 3, max = 50, message = "Username : 3 a 50 caracteres")
        private String username;

        private String email;

        @NotBlank(message = "Password requis")
        @Size(min = 8, max = 100, message = "Password : 8 a 100 caracteres")
        private String password;

        private String role;
    }
}