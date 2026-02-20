package com.eathub.common.controller;

import com.eathub.common.entity.Restaurant;
import com.eathub.common.entity.HomeFoodProvider;
import com.eathub.common.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;

@RestController
@RequestMapping("/v1/discovery")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:9004")
public class DiscoveryController {

    private final MenuItemRepository menuItemRepository;

    @GetMapping("/category/{title}")
    public ResponseEntity<Map<String, Object>> getProvidersByCategory(@PathVariable String title) {
        try {
            List<Restaurant> restaurants = menuItemRepository.findRestaurantsByCategory(title);
            List<HomeFoodProvider> homeFoods = menuItemRepository.findHomeFoodProvidersByCategory(title);

            Map<String, Object> response = new HashMap<>();
            // Ensure we never return null, always an empty list
            response.put("restaurants", restaurants != null ? restaurants : Collections.emptyList());
            response.put("homeFoods", homeFoods != null ? homeFoods : Collections.emptyList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Discovery Error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
} 