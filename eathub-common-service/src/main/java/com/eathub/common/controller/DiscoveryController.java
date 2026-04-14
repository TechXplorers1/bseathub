package com.eathub.common.controller;

import com.eathub.common.entity.Restaurant;
import com.eathub.common.entity.HomeFoodProvider;
import com.eathub.common.entity.MenuItem;
import com.eathub.common.entity.Chef;
import com.eathub.common.repository.MenuItemRepository;
import com.eathub.common.repository.ChefRepository;
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
@CrossOrigin(origins = "*")
public class DiscoveryController {

    private final MenuItemRepository menuItemRepository;
    private final ChefRepository chefRepository;

    @GetMapping("/category/{title}")
    public ResponseEntity<Map<String, Object>> getProvidersByCategory(@PathVariable String title) {
        try {
            List<Restaurant> restaurants = menuItemRepository.findRestaurantsByCategory(title);
            List<HomeFoodProvider> homeFoods = menuItemRepository.findHomeFoodProvidersByCategory(title);
            List<MenuItem> items = menuItemRepository.findMenuItemsByCategory(title);
            List<Chef> chefs = chefRepository.findChefsByCategory(title);

            // Populate provider info for individual items
            if (items != null) {
                items.forEach(item -> {
                    if (item.getRestaurant() != null) {
                        item.setProviderName(item.getRestaurant().getName());
                        item.setProviderId(item.getRestaurant().getId());
                        item.setProviderType("restaurant");
                        item.setProviderSlug(item.getRestaurant().getSlug());
                    } else if (item.getHomeFood() != null) {
                        item.setProviderName(item.getHomeFood().getBrandName());
                        item.setProviderId(item.getHomeFood().getId());
                        item.setProviderType("home-food");
                        item.setProviderSlug(item.getHomeFood().getSlug());
                    }
                });
            }

            Map<String, Object> response = new HashMap<>();
            response.put("restaurants", restaurants != null ? restaurants : Collections.emptyList());
            response.put("homeFoods", homeFoods != null ? homeFoods : Collections.emptyList());
            response.put("items", items != null ? items : Collections.emptyList());
            response.put("chefs", chefs != null ? chefs : Collections.emptyList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Discovery Error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}