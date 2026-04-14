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
    private final UserProfileRepository userProfileRepository;
    private final RestaurantRepository restaurantRepository;
    private final ChefRepository chefRepository;
    private final HomeFoodProviderRepository homeFoodRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;

    @Transactional
    public AuthResponse registerPartner(PartnerRegistrationRequest request) {
        Map<String, Object> data = request.getData();
        String type = request.getType();
        String email = (String) data.get("email");

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        String displayName;
        UserRole targetRole;

        if ("Restaurant".equalsIgnoreCase(type)) {
            targetRole = UserRole.RESTAURANT;
            displayName = (String) data.get("restaurantName");
            if (displayName == null || displayName.isEmpty()) {
                displayName = email.split("@")[0] + "'s Kitchen";
            }
        } else if ("Home Food".equalsIgnoreCase(type)) {
            targetRole = UserRole.HOMEFOOD;
            displayName = (String) data.get("kitchenName");
            if (displayName == null || displayName.isEmpty()) {
                displayName = (String) data.get("fullName");
            }
            if (displayName == null || displayName.isEmpty()) {
                displayName = email.split("@")[0] + "'s Home Food";
            }
        } else if ("Chef".equalsIgnoreCase(type)) {
            targetRole = UserRole.CHEF;
            displayName = (String) data.get("fullName");
            if (displayName == null || displayName.isEmpty()) {
                displayName = email.split("@")[0];
            }
        } else {
            targetRole = UserRole.USER;
            displayName = (String) data.getOrDefault("fullName", email.split("@")[0]);
        }

        // Create User
        User user = User.builder()
                .name(displayName)
                .email(email)
                .phone((String) data.get("contactNumber"))
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
            res.setType((String) data.getOrDefault("restaurantType", "Multi-cuisine"));
            res.setCuisineType((String) data.getOrDefault("cuisineType", "Various"));
            res.setBusinessModel((String) data.getOrDefault("businessModel", "delivery"));
            Object radius = data.get("deliveryRadius");
            if (radius != null) {
                res.setDeliveryRadius(Double.valueOf(radius.toString()));
            } else {
                res.setDeliveryRadius(5.0);
            }
            res.setIsOpen(true);

            // Hours
            Map<String, String> hours = (Map<String, String>) data.get("operatingHours");
            if (hours != null) {
                res.setWorkingHours(hours.get("open") + " - " + hours.get("close"));
            } else {
                res.setWorkingHours("09:00 - 22:00");
            }

            Restaurant savedRes = restaurantRepository.save(res);
            providerIdResult = savedRes.getId();

            // Address (only if some address info is provided)
            if (data.containsKey("city") || data.containsKey("street")) {
                RestaurantAddress addr = RestaurantAddress.builder()
                        .restaurant(savedRes)
                        .country((String) data.getOrDefault("country", "India"))
                        .state((String) data.get("state"))
                        .city((String) data.get("city"))
                        .postalCode((String) data.get("pincode"))
                        .addressLine1((String) data.get("street"))
                        .build();
                savedRes.setAddress(addr);
            }

            // Legal Profile (only if legal info is provided)
            if (data.containsKey("panNumber") || data.containsKey("bankAccountNumber")
                    || data.containsKey("fssaiLicenseNumber") || data.containsKey("legalBusinessName")) {
                RestaurantLegalProfile lp = RestaurantLegalProfile.builder()
                        .restaurant(savedRes)
                        .legalBusinessName((String) data.get("legalBusinessName"))
                        .gstNumber((String) data.get("gstNumber"))
                        .panNumber((String) data.get("panNumber"))
                        .fssaiLicenseNumber((String) data.get("fssaiLicenseNumber"))
                        .fssaiDocumentUrl((String) data.get("fssaiDocument"))
                        .businessType((String) data.get("businessType"))
                        .bankAccountHolderName((String) data.get("bankAccountHolderName"))
                        .bankAccountNumber((String) data.get("bankAccountNumber"))
                        .bankIFSC((String) data.get("bankIFSC"))
                        .bankName((String) data.get("bankName"))
                        .build();

                String fssaiExpiry = (String) data.get("fssaiExpiryDate");
                if (fssaiExpiry != null && !fssaiExpiry.isEmpty()) {
                    lp.setFssaiExpiryDate(java.time.LocalDate.parse(fssaiExpiry));
                }
                savedRes.setLegalProfile(lp);
            }
            restaurantRepository.save(savedRes);

        } else if (targetRole == UserRole.HOMEFOOD) {
            HomeFoodProvider hfp = new HomeFoodProvider();
            hfp.setOwner(savedUser);
            hfp.setBrandName(displayName);
            hfp.setSlug(generateSlug(displayName));
            hfp.setIsActive(true);

            Object cuisineTypes = data.get("cuisineTypes");
            if (cuisineTypes instanceof java.util.List) {
                hfp.setFoodType(String.join(", ", (java.util.List<String>) cuisineTypes));
            }
            hfp.setSpecialtyDishes((String) data.get("specialtyDishes"));
            hfp.setDeliveryAvailability((String) data.get("deliveryAvailability"));

            HomeFoodProvider savedHfp = homeFoodRepository.save(hfp);
            providerIdResult = savedHfp.getId();

            // Address
            HomeFoodAddress addr = HomeFoodAddress.builder()
                    .homeFoodProvider(savedHfp)
                    .country((String) data.get("country"))
                    .state((String) data.get("state"))
                    .city((String) data.get("city"))
                    .postalCode((String) data.get("postalCode"))
                    .addressLine1((String) data.get("street"))
                    .build();
            savedHfp.setAddress(addr);

            // Legal
            HomeFoodLegalProfile lp = HomeFoodLegalProfile.builder()
                    .homeFoodProvider(savedHfp)
                    .idProofType((String) data.get("idProofType"))
                    .idProofNumber((String) data.get("idProofNumber"))
                    .hygieneVerified((Boolean) data.get("hygieneVerified"))
                    .bankAccountHolderName((String) data.get("bankAccountHolderName"))
                    .bankAccountNumber((String) data.get("bankAccountNumber"))
                    .bankIFSC((String) data.get("bankIFSC"))
                    .bankName((String) data.get("bankName"))
                    .build();
            savedHfp.setLegalProfile(lp);
            homeFoodRepository.save(savedHfp);

        } else if (targetRole == UserRole.CHEF) {
            Chef chef = new Chef();
            chef.setOwner(savedUser);
            chef.setName(displayName);
            chef.setSlug(generateSlug(displayName));
            chef.setExperience((String) data.get("experience"));
            chef.setIsActive(true);

            Object specialtyCuisines = data.get("specialtyCuisines");
            if (specialtyCuisines instanceof java.util.List) {
                chef.setSpecialty(String.join(", ", (java.util.List<String>) specialtyCuisines));
            }

            Object workType = data.get("workType");
            if (workType instanceof java.util.List) {
                chef.setWorkType(String.join(", ", (java.util.List<String>) workType));
            }

            Object basePrice = data.get("basePrice");
            if (basePrice != null) {
                chef.setBasePrice(Double.valueOf(basePrice.toString()));
            }

            chef.setWorkingHours(data.get("availabilityStartTime") + " - " + data.get("availabilityEndTime"));
            chef.setSocialLinks((String) data.get("socialLinks"));

            Chef savedChef = chefRepository.save(chef);
            providerIdResult = savedChef.getId();

            // Address
            ChefAddress addr = ChefAddress.builder()
                    .chef(savedChef)
                    .city((String) data.get("currentCity"))
                    .build();
            savedChef.setAddress(addr);

            // Legal
            ChefLegalProfile lp = ChefLegalProfile.builder()
                    .chef(savedChef)
                    .idProofType((String) data.get("idProofType"))
                    .idProofNumber((String) data.get("idProofNumber"))
                    .bankAccountHolderName((String) data.get("bankAccountHolderName"))
                    .bankAccountNumber((String) data.get("bankAccountNumber"))
                    .bankIFSC((String) data.get("bankIFSC"))
                    .bankName((String) data.get("bankName"))
                    .build();
            savedChef.setLegalProfile(lp);
            chefRepository.save(savedChef);
        }

        return new AuthResponse(jwtService.generateToken(savedUser), savedUser.getEmail(), savedUser.getRole().name(),
                providerIdResult, savedUser.getName(), savedUser.getAvatarUrl(), savedUser.getId());
    }

    private String generateSlug(String name) {
        if (name == null) {
            name = "partner";
        }
        return name.toLowerCase().replaceAll("[^a-z0-9]", "-") + "-" + UUID.randomUUID().toString().substring(0, 5);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String providerId = null;

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
                user.getAvatarUrl(),
                user.getId());
    }

    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(request.getEmail())
                            .name(request.getName())
                            .avatarUrl(request.getPhotoUrl())
                            .role(UserRole.USER)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .build();
                    return userRepository.save(newUser);
                });

        // If user exists but avatar is null, update it
        if (user.getAvatarUrl() == null && request.getPhotoUrl() != null) {
            user.setAvatarUrl(request.getPhotoUrl());
            userRepository.save(user);
        }

        String providerId = null;
        if (user.getRole() == UserRole.RESTAURANT) {
            providerId = restaurantRepository.findByOwnerId(user.getId()).map(Restaurant::getId).orElse(null);
        } else if (user.getRole() == UserRole.HOMEFOOD) {
            providerId = homeFoodRepository.findByOwnerId(user.getId()).map(HomeFoodProvider::getId).orElse(null);
        } else if (user.getRole() == UserRole.CHEF) {
            providerId = chefRepository.findByOwnerId(user.getId()).map(Chef::getId).orElse(null);
        }

        return new AuthResponse(
                jwtService.generateToken(user),
                user.getEmail(),
                user.getRole().name(),
                providerId,
                user.getName(),
                user.getAvatarUrl(),
                user.getId());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getMobileNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .avatarUrl(null)
                .build();

        User savedUser = userRepository.save(user);

        UserProfile profile = UserProfile.builder()
                .user(savedUser)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .houseNumber(request.getHouseNumber())
                .street(request.getStreet())
                .area(request.getArea())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .build();

        userProfileRepository.save(profile);

        return new AuthResponse(jwtService.generateToken(savedUser), savedUser.getEmail(), savedUser.getRole().name(),
                null, savedUser.getName(), savedUser.getAvatarUrl(), savedUser.getId());
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User with this email does not exist"));
        otpService.generateAndSendOtp(user.getEmail());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!otpService.verifyOtp(request.getEmail(), request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
