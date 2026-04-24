package com.eathub.common.controller;

import com.eathub.common.entity.Restaurant;
import com.eathub.common.entity.HomeFoodProvider;
import com.eathub.common.entity.MenuItem;
import com.eathub.common.entity.Chef;
import com.eathub.common.dto.RestaurantResponseDTO;
import com.eathub.common.dto.HomeFoodResponseDTO;
import com.eathub.common.dto.MenuItemDTO;
import com.eathub.common.service.RestaurantService;
import com.eathub.common.service.HomeFoodService;
import com.eathub.common.repository.MenuItemRepository;
import com.eathub.common.repository.ChefRepository;
import com.eathub.common.repository.RestaurantRepository;
import com.eathub.common.repository.HomeFoodProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/discovery")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DiscoveryController {

    private final MenuItemRepository menuItemRepository;
    private final ChefRepository chefRepository;
    private final RestaurantRepository restaurantRepository;
    private final HomeFoodProviderRepository homeFoodRepository;
    private final RestaurantService restaurantService;
    private final HomeFoodService homeFoodService;

    @GetMapping("/category/{title}")
    public ResponseEntity<Map<String, Object>> getProvidersByCategory(@PathVariable String title) {
        try {
            String searchTitle = title.trim();
            List<Restaurant> rawRestaurants = menuItemRepository.findRestaurantsByCategory(searchTitle);
            List<HomeFoodProvider> rawHomeFoods = menuItemRepository.findHomeFoodProvidersByCategory(searchTitle);
            List<MenuItem> rawItems = menuItemRepository.findMenuItemsByCategory(searchTitle);
            List<Chef> rawChefs = chefRepository.findChefsByCategory(searchTitle);

            System.out.println("Discovery: " + searchTitle + " -> " + rawItems.size() + " items found");

            // Convert to DTOs to avoid circular dependencies and huge payloads
            List<RestaurantResponseDTO> restaurants = rawRestaurants.stream()
                    .map(restaurantService::mapToResponseDTO)
                    .collect(Collectors.toList());

            List<HomeFoodResponseDTO> homeFoods = rawHomeFoods.stream()
                    .map(homeFoodService::mapToDTO)
                    .collect(Collectors.toList());

            List<MenuItemDTO> items = rawItems.stream()
                    .map(item -> {
                        MenuItemDTO dto = MenuItemDTO.builder()
                                .id(item.getId())
                                .name(item.getName())
                                .description(item.getDescription())
                                .price(item.getPrice())
                                .status(item.getStatus())
                                .isSpecial(item.getIsSpecial())
                                .imageId(item.getImageId())
                                .category(item.getCategory() != null ? item.getCategory().getTitle() : "General")
                                .build();
                        
                        if (item.getRestaurant() != null) {
                            dto.setProviderName(item.getRestaurant().getName());
                            dto.setProviderId(item.getRestaurant().getId());
                            dto.setProviderType("restaurant");
                            dto.setProviderSlug(item.getRestaurant().getSlug());
                        } else if (item.getHomeFood() != null) {
                            dto.setProviderName(item.getHomeFood().getBrandName());
                            dto.setProviderId(item.getHomeFood().getId());
                            dto.setProviderType("home-food");
                            dto.setProviderSlug(item.getHomeFood().getSlug());
                        }
                        return dto;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("restaurants", restaurants);
            response.put("homeFoods", homeFoods);
            response.put("items", items);
            response.put("chefs", rawChefs != null ? rawChefs : Collections.emptyList());
            response.put("categoryName", searchTitle);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Discovery Error: " + e.getMessage());
            e.printStackTrace();
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
                if (r.getOwner() != null) {
                    item.put("ownerId", r.getOwner().getId());
                }
                Double dist = (provLat != null && provLng != null) ? haversine(lat, lng, provLat, provLng) : null;
                item.put("distanceKm", dist);

                // If a specific low radius is provided (distance filter active), exclude null coordinates
                if (radius < 50) {
                    if (dist != null && dist <= radius) {
                        restaurants.add(item);
                    }
                } else {
                    // Default view: include everyone (null distance at end)
                    if (dist == null || dist <= radius) {
                        restaurants.add(item);
                    }
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
                if (p.getOwner() != null) {
                    item.put("ownerId", p.getOwner().getId());
                }
                Double dist = (provLat != null && provLng != null) ? haversine(lat, lng, provLat, provLng) : null;
                item.put("distanceKm", dist);

                // If a specific low radius is provided (distance filter active), exclude null coordinates
                if (radius < 50) {
                    if (dist != null && dist <= radius) {
                        homeFoods.add(item);
                    }
                } else {
                    // Default view: include everyone (null distance at end)
                    if (dist == null || dist <= radius) {
                        homeFoods.add(item);
                    }
                }
            });
            homeFoods.sort(Comparator.comparingDouble(m -> {
                Double d = (Double) m.get("distanceKm");
                return d == null ? Double.MAX_VALUE : d;
            }));

            List<Map<String, Object>> chefs = new ArrayList<>();
            chefRepository.findAllWithDetails().forEach(c -> {
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
                if (c.getOwner() != null) {
                    item.put("ownerId", c.getOwner().getId());
                }
                Double dist = (provLat != null && provLng != null) ? haversine(lat, lng, provLat, provLng) : null;
                item.put("distanceKm", dist);
                
                // If a specific low radius is provided (distance filter active), exclude null coordinates
                if (radius < 50) {
                    if (dist != null && dist <= radius) {
                        chefs.add(item);
                    }
                } else {
                    // Default view: include everyone (null distance at end)
                    if (dist == null || dist <= radius) {
                        chefs.add(item);
                    }
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