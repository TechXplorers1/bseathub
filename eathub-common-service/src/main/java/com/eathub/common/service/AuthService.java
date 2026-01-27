package com.eathub.common.service;

import com.eathub.common.dto.AuthDTOs.*;
import com.eathub.common.entity.User;
import com.eathub.common.entity.UserRole;
import com.eathub.common.repository.UserRepository;
import com.eathub.common.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // ... Existing register() and login() methods ...

    // AuthService.java
@Transactional
public AuthResponse registerPartner(PartnerRegistrationRequest request) {
    try {
        if (request == null || request.getData() == null) {
            throw new RuntimeException("Invalid request payload");
        }

        Map<String, Object> data = request.getData();
        String email = (String) data.get("email");

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        // Use safe extraction to prevent NullPointerExceptions
        String rawPassword = (String) data.get("password");
        if (rawPassword == null) throw new RuntimeException("Password is required");

        String name = "Restaurant".equalsIgnoreCase(request.getType()) 
                      ? (String) data.getOrDefault("restaurantName", "Unknown Restaurant") 
                      : (String) data.getOrDefault("fullName", "Unknown Partner");

        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(UserRole.PARTNER)
                .build();

        userRepository.save(user);

        // This method will handle specific tables (Restaurants/Chefs)
        saveSpecificPartnerData(user, request.getType(), data);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getRole().name());

    } catch (Exception e) {
        // Log the actual error to your terminal
        System.err.println("REGISTRATION ERROR: " + e.getMessage());
        e.printStackTrace(); 
        throw new RuntimeException(e.getMessage());
    }
}


    private void saveSpecificPartnerData(User user, String type, Map<String, Object> data) {
        switch (type) {
            case "Restaurant":
                // Map fields like data.get("gstNumber"), data.get("fssaiLicenseNumber")
                break;
            case "Home Food":
                // Map fields like data.get("kitchenName"), data.get("idProofNumber")
                break;
            case "Chef":
                // Map fields like data.get("experience"), data.get("specialtyCuisines")
                break;
            default:
                throw new IllegalArgumentException("Invalid partner type: " + type);
        }
    }
    
    // Fixed Login method from your snippet
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }
}