package com.eathub.common.controller;

import com.eathub.common.dto.HomeFoodProfileUpdateDTO;
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
@CrossOrigin(origins = "http://localhost:3000") // Adjusted to standard Next.js port
public class HomeFoodController {
    private final HomeFoodService homeFoodService;
    private final HomeFoodProviderRepository repository;

    @GetMapping
    public List<HomeFoodResponseDTO> getAll() {
        return homeFoodService.getAllHomeFoods();
    }

    @GetMapping("/{id}")
    public HomeFoodResponseDTO getById(@PathVariable String id) {
        return homeFoodService.getHomeFoodById(id);
    }

    @GetMapping("/slug/{slug}")
    public HomeFoodResponseDTO getBySlug(@PathVariable String slug) {
        return repository.findBySlug(slug)
                .or(() -> repository.findById(slug))
                .map(homeFoodService::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Home food provider not found with slug or ID: " + slug));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public HomeFoodResponseDTO register(@RequestBody HomeFoodRequestDTO request) {
        return homeFoodService.registerHomeFoodProvider(request);
    }

    // ── Profile Updates ──────────────────────────────────────────────────
    @PutMapping("/{id}/profile")
    public HomeFoodResponseDTO updateProfile(@PathVariable String id, @RequestBody HomeFoodProfileUpdateDTO dto) {
        return homeFoodService.updateProfile(id, dto);
    }

    @PutMapping("/{id}/address")
    public HomeFoodResponseDTO updateAddress(@PathVariable String id, @RequestBody HomeFoodProfileUpdateDTO dto) {
        return homeFoodService.updateAddress(id, dto);
    }

    @PutMapping("/{id}/legal")
    public HomeFoodResponseDTO updateLegal(@PathVariable String id, @RequestBody HomeFoodProfileUpdateDTO dto) {
        return homeFoodService.updateLegal(id, dto);
    }

    // ── Menu Items ───────────────────────────────────────────────────────
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

    // @PutMapping("/menu-items/{id}")
    // public ResponseEntity<?> updateMenuItem(@PathVariable String id, @RequestBody MenuItemRequestDTO dto) {
    //     try {
    //         return ResponseEntity.ok(homeFoodService.updateMenuItem(id, dto));
    //     } catch (Exception e) {
    //         return ResponseEntity.status(500).body("Error updating dish: " + e.getMessage());
    //     }
    // }

    // @DeleteMapping("/menu-items/{id}")
    // public ResponseEntity<?> deleteMenuItem(@PathVariable String id) {
    //     try {
    //         homeFoodService.deleteMenuItem(id);
    //         return ResponseEntity.ok().build();
    //     } catch (Exception e) {
    //         return ResponseEntity.status(500).body("Error deleting dish: " + e.getMessage());
    //     }
    // }
}
