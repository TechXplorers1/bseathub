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
import java.util.ArrayList;
import java.util.Comparator;

@RestController
@RequestMapping("/v1/discovery")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DiscoveryController {

    private final MenuItemRepository menuItemRepository;
    private final ChefRepository chefRepository;
    private final com.eathub.common.repository.RestaurantRepository restaurantRepository;
    private final com.eathub.common.repository.HomeFoodProviderRepository homeFoodRepository;

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

    /**
     * Returns providers sorted by distance from the given lat/lng.
     * Providers without coordinates are included at the end with distance = null.
     * @param lat  User's latitude
     * @param lng  User's longitude
     * @param radius  Max radius in km (default 50)
     */
    @GetMapping("/nearby")
    public ResponseEntity<Map<String, Object>> getNearbyProviders(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "50") double radius) {
        try {
            // Fetch all providers via service DTOs (already flattened with address fields)
            List<Map<String, Object>> restaurants = new ArrayList<>();
            restaurantRepository.findAllWithDetails().forEach(r -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", r.getId());
                item.put("name", r.getName());
                item.put("slug", r.getSlug());
                item.put("type", "restaurant");
                item.put("cuisineType", r.getCuisine());
                item.put("rating", r.getRating());
                item.put("imageId", r.getImageId());
                item.put("avgDeliveryTime", r.getAvgDeliveryTime());
                item.put("isOpen", r.getIsOpen());
                Double provLat = null, provLng = null;
                if (r.getAddress() != null) {
                    provLat = r.getAddress().getLatitude();
                    provLng = r.getAddress().getLongitude();
                    item.put("city", r.getAddress().getCity());
                    item.put("addressLine1", r.getAddress().getAddressLine1());
                }
                item.put("latitude", provLat);
                item.put("longitude", provLng);
                Double dist = (provLat != null && provLng != null) ? haversine(lat, lng, provLat, provLng) : null;
                item.put("distanceKm", dist);
                if (dist == null || dist <= radius) {
                    restaurants.add(item);
                }
            });
            restaurants.sort(Comparator.comparingDouble(m -> {
                Double d = (Double) m.get("distanceKm");
                return d == null ? Double.MAX_VALUE : d;
            }));

            List<Map<String, Object>> homeFoods = new ArrayList<>();
            homeFoodRepository.findAllWithDetails().forEach(p -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", p.getId());
                item.put("name", p.getBrandName());
                item.put("slug", p.getSlug());
                item.put("type", "home-food");
                item.put("cuisineType", p.getFoodType());
                item.put("rating", p.getRating());
                item.put("imageId", p.getImageId());
                item.put("avgDeliveryTime", p.getAvgDeliveryTime());
                item.put("isOpen", p.getIsActive());
                Double provLat = null, provLng = null;
                if (p.getAddress() != null) {
                    provLat = p.getAddress().getLatitude();
                    provLng = p.getAddress().getLongitude();
                    item.put("city", p.getAddress().getCity());
                    item.put("addressLine1", p.getAddress().getAddressLine1());
                }
                item.put("latitude", provLat);
                item.put("longitude", provLng);
                Double dist = (provLat != null && provLng != null) ? haversine(lat, lng, provLat, provLng) : null;
                item.put("distanceKm", dist);
                if (dist == null || dist <= radius) {
                    homeFoods.add(item);
                }
            });
            homeFoods.sort(Comparator.comparingDouble(m -> {
                Double d = (Double) m.get("distanceKm");
                return d == null ? Double.MAX_VALUE : d;
            }));

            List<Map<String, Object>> chefs = new ArrayList<>();
            chefRepository.findAll().forEach(c -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", c.getId());
                item.put("name", c.getName());
                item.put("slug", c.getSlug());
                item.put("type", "chef");
                item.put("specialty", c.getSpecialty());
                item.put("rating", c.getRating());
                item.put("avatarUrl", c.getAvatarUrl());
                Double provLat = null, provLng = null;
                if (c.getAddress() != null) {
                    provLat = c.getAddress().getLatitude();
                    provLng = c.getAddress().getLongitude();
                    item.put("city", c.getAddress().getCity());
                }
                item.put("latitude", provLat);
                item.put("longitude", provLng);
                Double dist = (provLat != null && provLng != null) ? haversine(lat, lng, provLat, provLng) : null;
                item.put("distanceKm", dist);
                if (dist == null || dist <= radius) {
                    chefs.add(item);
                }
            });
            chefs.sort(Comparator.comparingDouble(m -> {
                Double d = (Double) m.get("distanceKm");
                return d == null ? Double.MAX_VALUE : d;
            }));

            Map<String, Object> response = new HashMap<>();
            response.put("restaurants", restaurants);
            response.put("homeFoods", homeFoods);
            response.put("chefs", chefs);
            response.put("userLat", lat);
            response.put("userLng", lng);
            response.put("radiusKm", radius);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Nearby Discovery Error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /** Haversine formula — returns distance in km */
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}