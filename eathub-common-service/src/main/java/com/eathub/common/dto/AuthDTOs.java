package com.eathub.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

public class AuthDTOs {
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest { // Added static
        private String name;
        private String email;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest { // Added static
        private String email;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartnerRegistrationRequest { // Added static
        private String type; 
        private Map<String, Object> data; 
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthResponse { // Added static
        private String token;
        private String email;
        private String role;
        private String restaurantId;
    }
}