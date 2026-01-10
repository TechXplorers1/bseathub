package com.eathub.common.controller;

import com.eathub.common.entity.Restaurant;
import com.eathub.common.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:9004"})
public class RestaurantController {
    private final RestaurantService restaurantService;

    // Called when a user submits the registration form
    @PostMapping("/register")
    public ResponseEntity<Restaurant> register(@RequestBody Restaurant restaurant) {
        Restaurant savedRestaurant = restaurantService.registerRestaurant(restaurant);
        return ResponseEntity.ok(savedRestaurant);
    }

    // Called by the Homepage to show all stored restaurants
    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }

    @GetMapping("/{slug}")
    public Restaurant getBySlug(@PathVariable String slug) {
        return restaurantService.getRestaurantBySlug(slug);
    }
}