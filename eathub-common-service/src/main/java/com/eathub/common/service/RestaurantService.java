package com.eathub.common.service;

import com.eathub.common.dto.RestaurantCreateRequestDTO;
import com.eathub.common.dto.RestaurantResponseDTO;
import com.eathub.common.entity.Restaurant;
import com.eathub.common.entity.User;
import com.eathub.common.repository.RestaurantRepository;
import com.eathub.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Transactional
    public RestaurantResponseDTO registerRestaurant(
            RestaurantCreateRequestDTO dto) {

        // Find or auto-create owner
        String ownerId = dto.getOwnerId();

        User owner = userRepository.findById(ownerId)
                .orElseGet(() -> {
                    User user = new User();
                    user.setId(ownerId);
                    user.setName("Temporary Owner");
                    user.setEmail(ownerId + "@eathub.com");
                    return userRepository.save(user);
                });

        // Map DTO → Entity
        Restaurant restaurant = new Restaurant();
        restaurant.setName(dto.getName());
        restaurant.setDescription(dto.getDescription());
        restaurant.setCuisineType(dto.getCuisineType());
        restaurant.setSlug(dto.getSlug());
        restaurant.setOwner(owner);

        // UI defaults
        restaurant.setRating(4.0);
        restaurant.setReviewsCount(0);
        restaurant.setIsOpen(true);

        Restaurant savedRestaurant =
                restaurantRepository.save(restaurant);

        // Map Entity → DTO
        return mapToResponseDTO(savedRestaurant);
    }

    public List<RestaurantResponseDTO> getAllRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public RestaurantResponseDTO getRestaurantBySlug(String slug) {
        Restaurant restaurant =
                restaurantRepository.findBySlug(slug)
                        .orElseThrow(() ->
                                new RuntimeException("Restaurant not found"));

        return mapToResponseDTO(restaurant);
    }

    // ---------- Mapper ----------
    private RestaurantResponseDTO mapToResponseDTO(Restaurant restaurant) {

        RestaurantResponseDTO dto = new RestaurantResponseDTO();
        dto.setId(restaurant.getId());
        dto.setName(restaurant.getName());
        dto.setDescription(restaurant.getDescription());
        dto.setCuisineType(restaurant.getCuisineType());
        dto.setSlug(restaurant.getSlug());
        dto.setRating(restaurant.getRating());
        dto.setReviewsCount(restaurant.getReviewsCount());
        dto.setIsOpen(restaurant.getIsOpen());

        return dto;
    }
}
