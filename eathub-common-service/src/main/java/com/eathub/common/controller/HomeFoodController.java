package com.eathub.common.controller;

import com.eathub.common.dto.HomeFoodRequestDTO;
import com.eathub.common.dto.MenuItemRequestDTO;
import com.eathub.common.dto.HomeFoodResponseDTO;
import com.eathub.common.repository.HomeFoodProviderRepository;
import com.eathub.common.service.HomeFoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/v1/home-food")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:9004") // Adjusted to standard Next.js port
public class HomeFoodController {
    private final HomeFoodService homeFoodService;
    private final HomeFoodProviderRepository repository;

    @GetMapping
    public List<HomeFoodResponseDTO> getAll() {
        return homeFoodService.getAllHomeFoods();
    }

    @GetMapping("/slug/{slug}")
    public HomeFoodResponseDTO getBySlug(@PathVariable String slug) {
        return repository.findBySlug(slug)
                .or(() -> repository.findById(slug))
                .map(provider -> {
                    HomeFoodResponseDTO dto = new HomeFoodResponseDTO();
                    dto.setId(provider.getId());
                    dto.setName(provider.getBrandName());
                    dto.setSlug(provider.getSlug());
                    dto.setCuisine(provider.getFoodType());
                    dto.setRating(provider.getRating());
                    dto.setReviews(provider.getReviewsCount());
                    dto.setImageId(provider.getImageId() != null ? provider.getImageId() : "home-food-default");
                    dto.setDeliveryTime(30);
                    dto.setDeliveryFee(0.0);
                    return dto;
                })
                .orElseThrow(() -> new RuntimeException("Home food provider not found with slug or ID: " + slug));
    }

    // This is the "Push" call for when a new provider joins
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public HomeFoodResponseDTO register(@RequestBody HomeFoodRequestDTO request) {
        return homeFoodService.registerHomeFoodProvider(request);
    }

    @PostMapping("/{providerId}/menu-items")
    public ResponseEntity<?> addDish(@PathVariable String providerId, @RequestBody MenuItemRequestDTO dto) {
        try {
            return ResponseEntity.ok(homeFoodService.addDish(providerId, dto));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error adding dish: " + e.getMessage());
        }
    }

    @GetMapping("/{providerId}/menu-items")
    public ResponseEntity<?> getMenu(@PathVariable String providerId) {
        try {
            return ResponseEntity.ok(homeFoodService.getHomeFoodMenu(providerId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching menu: " + e.getMessage());
        }
    }

    @PutMapping("/menu-items/{id}")
    public ResponseEntity<?> updateMenuItem(@PathVariable String id, @RequestBody MenuItemRequestDTO dto) {
        try {
            return ResponseEntity.ok(homeFoodService.updateMenuItem(id, dto));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating dish: " + e.getMessage());
        }
    }

    @DeleteMapping("/menu-items/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable String id) {
        try {
            homeFoodService.deleteMenuItem(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting dish: " + e.getMessage());
        }
    }
}
