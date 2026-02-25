package com.eathub.common.service;

import com.eathub.common.dto.RestaurantCreateRequestDTO;
import com.eathub.common.dto.RestaurantResponseDTO;
import com.eathub.common.dto.MenuItemRequestDTO;
import com.eathub.common.entity.*;
import com.eathub.common.repository.MenuCategoryRepository;
import com.eathub.common.repository.MenuItemRepository;
import com.eathub.common.repository.RestaurantRepository;
import com.eathub.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuItemRepository menuItemRepository;

    public List<RestaurantResponseDTO> getAllRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public RestaurantResponseDTO getRestaurantBySlug(String slug) {
        return restaurantRepository.findBySlug(slug)
                .map(this::mapToResponseDTO)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with slug: " + slug));
    }

    @Transactional
    public RestaurantResponseDTO registerRestaurant(RestaurantCreateRequestDTO dto) {
        // 1. Fetch or create the owner
        // Using saveAndFlush ensures the User exists in the DB session before
        // Restaurant links to it
        User owner = userRepository.findById(dto.getOwnerId())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setId(dto.getOwnerId());
                    newUser.setName(dto.getName() + " Partner");
                    newUser.setEmail(dto.getOwnerId() + "@eathub.com");
                    newUser.setPassword("default_pass");
                    newUser.setRole(UserRole.RESTAURANT);
                    return userRepository.saveAndFlush(newUser);
                });

        // 2. Map Restaurant
        Restaurant restaurant = new Restaurant();
        restaurant.setName(dto.getName());
        restaurant.setDescription(dto.getDescription());
        restaurant.setCuisineType(dto.getCuisineType());
        restaurant.setSlug(dto.getSlug());
        restaurant.setOwner(owner);
        restaurant.setType(dto.getRestaurantType() != null ? dto.getRestaurantType() : "General");

        // Set Defaults
        restaurant.setRating(4.0);
        restaurant.setReviewsCount(0);
        restaurant.setIsOpen(true);
        restaurant.setOperationalStatus("OPEN");

        // 3. Map Address
        RestaurantAddress address = RestaurantAddress.builder()
                .restaurant(restaurant)
                .addressLine1(dto.getAddressLine1())
                .city(dto.getCity())
                .state(dto.getState())
                .postalCode(dto.getPincode())
                .country("India")
                .build();
        restaurant.setAddress(address);

        // 4. Map Legal Profile
        RestaurantLegalProfile legal = RestaurantLegalProfile.builder()
                .restaurant(restaurant)
                .gstNumber(dto.getGstNumber())
                .bankAccountNumber(dto.getBankAccountNumber())
                .legalBusinessName(dto.getName())
                .build();
        restaurant.setLegalProfile(legal);

        // Save the restaurant (cascade will save address and legal profile)
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return mapToResponseDTO(savedRestaurant);
    }

    private RestaurantResponseDTO mapToResponseDTO(Restaurant restaurant) {
        RestaurantResponseDTO dto = new RestaurantResponseDTO();
        dto.setId(restaurant.getId());
        dto.setName(restaurant.getName());
        dto.setDescription(restaurant.getDescription());
        dto.setCuisineType(restaurant.getCuisine());
        dto.setSlug(restaurant.getSlug());
        dto.setRating(restaurant.getRating());
        dto.setReviewsCount(restaurant.getReviewsCount());
        dto.setIsOpen(restaurant.getIsOpen());
        return dto;
    }

    // RestaurantService.java - Update addDish method
    @Transactional
    public void addDish(String restaurantId, MenuItemRequestDTO dto) {
        try {
            Restaurant restaurant = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Restaurant ID " + restaurantId + " not found"));

            MenuCategory category;
            if (dto.getCategoryId() != null && !dto.getCategoryId().isEmpty()) {
                category = menuCategoryRepository.findById(dto.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category ID " + dto.getCategoryId() + " missing"));
            } else if (dto.getCategoryName() != null && !dto.getCategoryName().isEmpty()) {
                // Find or create by name for this restaurant
                category = menuCategoryRepository
                        .findByRestaurantIdAndTitleIgnoreCase(restaurantId, dto.getCategoryName())
                        .orElseGet(() -> {
                            MenuCategory newCat = MenuCategory.builder()
                                    .title(dto.getCategoryName())
                                    .restaurant(restaurant)
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
                    .restaurant(restaurant)
                    .status(dto.getStatus() != null ? dto.getStatus() : "Available")
                    .isSpecial(dto.getIsSpecial() != null ? dto.getIsSpecial() : false)
                    .imageId(dto.getImageUrl())
                    .build();

            menuItemRepository.save(newItem);
            System.out.println(" SUCCESS: Data saved to database for: " + dto.getName());

        } catch (Exception e) {
            System.err.println(" BACKEND ERROR: " + e.getMessage());
            throw e;
        }
    }

    public RestaurantResponseDTO getRestaurantById(String id) {
    return restaurantRepository.findById(id)
            .map(this::mapToResponseDTO)
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));
}
}