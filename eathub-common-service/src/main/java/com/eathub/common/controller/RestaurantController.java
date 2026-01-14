package com.eathub.common.controller;

import com.eathub.common.dto.RestaurantCreateRequestDTO;
import com.eathub.common.dto.RestaurantResponseDTO;
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
    public ResponseEntity<RestaurantResponseDTO> register(
            @RequestBody RestaurantCreateRequestDTO request) {

        RestaurantResponseDTO response =
                restaurantService.registerRestaurant(request);

        return ResponseEntity.ok(response);
    }

    // Called by the Homepage to show all stored restaurants
    @GetMapping
    public ResponseEntity<List<RestaurantResponseDTO>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<RestaurantResponseDTO> getBySlug(
            @PathVariable String slug) {

        return ResponseEntity.ok(
                restaurantService.getRestaurantBySlug(slug)
        );
    }
}
