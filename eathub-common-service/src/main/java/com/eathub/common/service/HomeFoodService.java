package com.eathub.common.service;

import com.eathub.common.dto.HomeFoodRequestDTO;
import com.eathub.common.dto.HomeFoodResponseDTO;
import com.eathub.common.entity.HomeFoodProvider;
import com.eathub.common.entity.User;
import com.eathub.common.repository.HomeFoodProviderRepository;
import com.eathub.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HomeFoodService {

    private final HomeFoodProviderRepository repository;
    private final UserRepository userRepository; // Added to link the owner

    /**
     * Retrieves all Home Food Providers from the database.
     */
    public List<HomeFoodResponseDTO> getAllHomeFoods() {
        return repository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Pushes new Home Food Provider data into the database.
     * This is called when a chef joins the app.
     */
    @Transactional
    public HomeFoodResponseDTO registerHomeFoodProvider(HomeFoodRequestDTO dto) {
        // 1. Verify the User (Owner) exists
        User owner = userRepository.findById(dto.getOwnerId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getOwnerId()));

        // 2. Map Request DTO to Entity
        HomeFoodProvider provider = HomeFoodProvider.builder()
                .brandName(dto.getBrandName())
                .slug(dto.getSlug())
                .foodType(dto.getFoodType())
                .description(dto.getDescription())
                .imageId(dto.getImageId() != null ? dto.getImageId() : "home-food-default")
                .rating(5.0) // New sign-ups start with a default 5.0 rating
                .reviewsCount(0)
                .isActive(true) // Set to active by default
                .owner(owner)
                .build();

        // 3. Save to PostgreSQL
        HomeFoodProvider savedProvider = repository.save(provider);

        // 4. Return the response DTO
        return mapToDTO(savedProvider);
    }

    /**
     * Helper method to map Entity to Response DTO
     */
    private HomeFoodResponseDTO mapToDTO(HomeFoodProvider provider) {
        HomeFoodResponseDTO dto = new HomeFoodResponseDTO();
        dto.setId(provider.getId());
        dto.setName(provider.getBrandName());
        dto.setSlug(provider.getSlug());
        dto.setCuisine(provider.getFoodType());
        dto.setRating(provider.getRating());
        dto.setReviews(provider.getReviewsCount());
        dto.setImageId(provider.getImageId() != null ? provider.getImageId() : "home-food-default");
        dto.setDeliveryTime(30); 
        dto.setDeliveryFee(0.0);
        return dto;
    }
}