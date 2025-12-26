package com.eathub.common.controller;

import com.eathub.common.entity.Restaurant;
import com.eathub.common.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
    private final RestaurantService restaurantService;

    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }

    @GetMapping("/{slug}")
    public Restaurant getBySlug(@PathVariable String slug) {
        return restaurantService.getRestaurantBySlug(slug);
    }
}
