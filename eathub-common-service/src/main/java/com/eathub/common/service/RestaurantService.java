package com.eathub.common.service;

import com.eathub.common.entity.Restaurant;
import com.eathub.common.entity.User;
import com.eathub.common.repository.RestaurantRepository;
import com.eathub.common.repository.UserRepository; // You need this
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantService {
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository; // Inject the user repository

    @Transactional
    public Restaurant registerRestaurant(Restaurant restaurant) {
        // 1. Fetch the existing owner from DB using the ID passed in the request
        String ownerId = restaurant.getOwner().getId();
        User existingUser = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found with ID: " + ownerId));

        // 2. Attach the managed user entity to the restaurant
        restaurant.setOwner(existingUser);

        // 3. Set default values
        if (restaurant.getRating() == null) restaurant.setRating(0.0);
        if (restaurant.getReviewsCount() == null) restaurant.setReviewsCount(0);
        if (restaurant.getIsOpen() == null) restaurant.setIsOpen(true);
        
        return restaurantRepository.save(restaurant);
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }
}