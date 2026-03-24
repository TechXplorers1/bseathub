package com.eathub.common.service;

import com.eathub.common.dto.AuthDTOs.*;
import com.eathub.common.entity.*;
import com.eathub.common.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final ChefRepository chefRepository;
    private final HomeFoodProviderRepository homeFoodRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse registerPartner(PartnerRegistrationRequest request) {
        Map<String, Object> data = request.getData();
        String type = request.getType();
        String email = (String) data.get("email");

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        // --- FIX: Logic to capture the correct Name for the User table ---
        String displayName;
        UserRole targetRole;

        if ("Restaurant".equalsIgnoreCase(type)) {
            targetRole = UserRole.RESTAURANT;
            displayName = (String) data.get("restaurantName"); // Use restaurant name
        } else if ("Home Food".equalsIgnoreCase(type)) {
            targetRole = UserRole.HOMEFOOD;
            displayName = (String) data.get("kitchenName"); // Use kitchen name
        } else if ("Chef".equalsIgnoreCase(type)) {
            targetRole = UserRole.CHEF;
            displayName = (String) data.get("fullName"); // Use chef name
        } else {
            targetRole = UserRole.USER;
            displayName = (String) data.getOrDefault("fullName", "Partner");
        }

        // Create User with the correct Name
        User user = User.builder()
                .name(displayName)
                .email(email)
                .password(passwordEncoder.encode((String) data.get("password")))
                .role(targetRole)
                .build();

        User savedUser = userRepository.save(user);

        String providerIdResult = null;
        if (targetRole == UserRole.RESTAURANT) {
            Restaurant res = new Restaurant();
            res.setOwner(savedUser);
            res.setName(displayName);
            res.setSlug(generateSlug(displayName));
            res.setCuisineType((String) data.get("cuisineType"));
            res.setIsOpen(true);
            providerIdResult = restaurantRepository.save(res).getId();
        } else if (targetRole == UserRole.HOMEFOOD) {
            HomeFoodProvider hfp = new HomeFoodProvider();
            hfp.setOwner(savedUser);
            hfp.setBrandName(displayName);
            hfp.setSlug(generateSlug(displayName));
            hfp.setIsActive(true);
            providerIdResult = homeFoodRepository.save(hfp).getId();
        } else if (targetRole == UserRole.CHEF) {
            Chef chef = new Chef();
            chef.setOwner(savedUser);
            chef.setName(displayName);
            chef.setSlug(generateSlug(displayName));
            chef.setSpecialty((String) data.get("specialty"));
            providerIdResult = chefRepository.save(chef).getId();
        }

        return new AuthResponse(jwtService.generateToken(savedUser), savedUser.getEmail(), savedUser.getRole().name(),
                providerIdResult, savedUser.getName(), savedUser.getAvatarUrl());
    }

    private String generateSlug(String name) {
        if (name == null)
            name = "partner";
        return name.toLowerCase().replaceAll("[^a-z0-9]", "-") + "-" + UUID.randomUUID().toString().substring(0, 5);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String providerId = null;

        // Fetch the specific ID for the dashboard based on role
        if (user.getRole() == UserRole.RESTAURANT) {
            providerId = restaurantRepository.findByOwnerId(user.getId())
                    .map(Restaurant::getId).orElse(null);
        } else if (user.getRole() == UserRole.HOMEFOOD) {
            providerId = homeFoodRepository.findByOwnerId(user.getId())
                    .map(HomeFoodProvider::getId).orElse(null);
        } else if (user.getRole() == UserRole.CHEF) {
            providerId = chefRepository.findByOwnerId(user.getId())
                    .map(Chef::getId).orElse(null);
        }

        return new AuthResponse(
                jwtService.generateToken(user),
                user.getEmail(),
                user.getRole().name(),
                providerId,
                user.getName(),
                user.getAvatarUrl());
    }

    // Add these methods inside AuthService class
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .avatarUrl(null) // Initialize as null for new users
                .build();
        User savedUser = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(savedUser), savedUser.getEmail(), savedUser.getRole().name(),
                null, savedUser.getName(), savedUser.getAvatarUrl());
    }

    // Instead of calling jwtService, just use the email passed from your request
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

}