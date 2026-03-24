package com.eathub.common.service;

import com.eathub.common.dto.UserProfileDTO;
import com.eathub.common.entity.User;
import com.eathub.common.entity.UserProfile;
import com.eathub.common.repository.UserProfileRepository;
import com.eathub.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final JwtService jwtService;

    public User getUserByToken(String token) {
        String jwt = token;
        if (jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
        }
        String email = jwtService.extractUsername(jwt);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found via token: " + email));
    }

    public UserProfileDTO getUserProfile(String token) {
        User user = getUserByToken(token);
        String userId = user.getId();

        UserProfile profile = userProfileRepository.findByUser_Id(userId).orElse(new UserProfile());

        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setAvatarUrl(user.getAvatarUrl());

        // Parse mobileNumber and countryCode from the User's phone if saved as one
        // field, or handled purely by frontend.
        dto.setMobileNumber(user.getPhone());

        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setHouseNumber(profile.getHouseNumber());
        dto.setStreet(profile.getStreet());
        dto.setArea(profile.getArea());
        dto.setCity(profile.getCity());
        dto.setState(profile.getState());
        dto.setCountry(profile.getCountry());

        return dto;
    }

    @Transactional
    public UserProfileDTO updateUserProfile(String token, UserProfileDTO dto) {
        User user = getUserByToken(token);
        String userId = user.getId();

        if (dto.getName() != null)
            user.setName(dto.getName());
        if (dto.getMobileNumber() != null)
            user.setPhone(dto.getMobileNumber());
        if (dto.getAvatarUrl() != null) {
            user.setAvatarUrl(dto.getAvatarUrl());
        }

        userRepository.save(user);

        UserProfile profile = userProfileRepository.findByUser_Id(userId).orElse(new UserProfile());
        profile.setUser(user);
        profile.setFirstName(dto.getFirstName());
        profile.setLastName(dto.getLastName());
        profile.setHouseNumber(dto.getHouseNumber());
        profile.setStreet(dto.getStreet());
        profile.setArea(dto.getArea());
        profile.setCity(dto.getCity());
        profile.setState(dto.getState());

        if (dto.getCountry() != null) {
            profile.setCountry(dto.getCountry());
        }

        userProfileRepository.save(profile);

        // Return optimized DTO directly instead of re-fetching
        UserProfileDTO response = new UserProfileDTO();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setMobileNumber(user.getPhone());
        response.setFirstName(profile.getFirstName());
        response.setLastName(profile.getLastName());
        response.setHouseNumber(profile.getHouseNumber());
        response.setStreet(profile.getStreet());
        response.setArea(profile.getArea());
        response.setCity(profile.getCity());
        response.setState(profile.getState());
        response.setCountry(profile.getCountry());
        
        return response;
    }
}
