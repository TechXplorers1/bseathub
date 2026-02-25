package com.eathub.common.service;

import com.eathub.common.dto.HomeFoodRequestDTO;
import com.eathub.common.dto.HomeFoodResponseDTO;
import com.eathub.common.dto.MenuItemRequestDTO;
import com.eathub.common.entity.MenuCategory;
import com.eathub.common.entity.MenuItem;
import com.eathub.common.entity.HomeFoodProvider;
import com.eathub.common.entity.User;
import com.eathub.common.repository.HomeFoodProviderRepository;
import com.eathub.common.repository.MenuCategoryRepository;
import com.eathub.common.repository.MenuItemRepository;
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
    private final UserRepository userRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuItemRepository menuItemRepository;

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

    @Transactional
    public void addDish(String ownerId, MenuItemRequestDTO dto) {
        HomeFoodProvider provider = repository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("Home Food Provider not found for owner: " + ownerId));

        MenuCategory category;
        if (dto.getCategoryId() != null && !dto.getCategoryId().isEmpty()) {
            category = menuCategoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category ID " + dto.getCategoryId() + " missing"));
        } else if (dto.getCategoryName() != null && !dto.getCategoryName().isEmpty()) {
            // Find or create by name for this provider
            category = menuCategoryRepository
                    .findByHomeFoodIdAndTitleIgnoreCase(provider.getId(), dto.getCategoryName())
                    .orElseGet(() -> {
                        MenuCategory newCat = MenuCategory.builder()
                                .title(dto.getCategoryName())
                                .homeFood(provider)
                                .build();
                        return menuCategoryRepository.save(newCat);
                    });
        } else {
            throw new RuntimeException("Category ID or Name must be provided");
        }

        MenuItem newItem = MenuItem.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .category(category)
                .homeFood(provider)
                .status(dto.getStatus() != null ? dto.getStatus() : "Available")
                .isSpecial(dto.getIsSpecial() != null ? dto.getIsSpecial() : false)
                .imageId(dto.getImageUrl())
                .build();

        menuItemRepository.save(newItem);
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