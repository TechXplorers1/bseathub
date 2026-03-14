package com.eathub.common.controller;

import com.eathub.common.dto.RestaurantCreateRequestDTO;
import com.eathub.common.dto.RestaurantProfileUpdateDTO;
import com.eathub.common.dto.RestaurantResponseDTO;
import com.eathub.common.dto.MenuItemRequestDTO;
import com.eathub.common.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/restaurants")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:9004"})
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping("/register")
    public ResponseEntity<RestaurantResponseDTO> register(
            @RequestBody RestaurantCreateRequestDTO request) {

        return ResponseEntity.ok(
                restaurantService.registerRestaurant(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<RestaurantResponseDTO>> getAllRestaurants() {
        return ResponseEntity.ok(
                restaurantService.getAllRestaurants()
        );
    }

    @GetMapping("/{slug}")
    public ResponseEntity<RestaurantResponseDTO> getBySlug(
            @PathVariable String slug) {

        return ResponseEntity.ok(
                restaurantService.getRestaurantBySlug(slug)
        );
    }

    @GetMapping("/{restaurantId}/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @PathVariable String restaurantId) {

        return ResponseEntity.ok(
                restaurantService.getDashboardOverview(restaurantId)
        );
    }

    @PostMapping("/{restaurantId}/menu-items")
    public ResponseEntity<String> addMenuItem(
            @PathVariable String restaurantId,
            @RequestBody MenuItemRequestDTO request) {

        restaurantService.addDish(restaurantId, request);
        return ResponseEntity.ok("Dish added successfully");
    }

    @GetMapping("/id/{restaurantId}")
    public ResponseEntity<RestaurantResponseDTO> getById(
            @PathVariable String restaurantId) {

        return ResponseEntity.ok(
                restaurantService.getRestaurantById(restaurantId)
        );
    }

    /** GET /restaurants/{id}/profile — returns full profile for settings form pre-fill */
    @GetMapping("/{id}/profile")
    public ResponseEntity<RestaurantResponseDTO> getProfile(
            @PathVariable String id) {
        return ResponseEntity.ok(restaurantService.getProfile(id));
    }

    /** PUT /restaurants/{id}/profile — saves name, bio, images, address, and bank details */
    @PutMapping("/{id}/profile")
    public ResponseEntity<RestaurantResponseDTO> updateProfile(
            @PathVariable String id,
            @RequestBody RestaurantProfileUpdateDTO dto) {
        return ResponseEntity.ok(restaurantService.updateProfile(id, dto));
    }
}