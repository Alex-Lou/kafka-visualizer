package com.kafkaflow.visualizer.dto;

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
        private String username;
        private String email;
        private String password;
        private String role;
    }
}