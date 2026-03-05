package com.eathub.common.controller;

import com.eathub.common.dto.HomeFoodRequestDTO;
import com.eathub.common.dto.MenuItemRequestDTO;
import com.eathub.common.dto.HomeFoodResponseDTO;
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

    @GetMapping
    public List<HomeFoodResponseDTO> getAll() {
        return homeFoodService.getAllHomeFoods();
    }

    // This is the "Push" call for when a new provider joins
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public HomeFoodResponseDTO register(@RequestBody HomeFoodRequestDTO request) {
        return homeFoodService.registerHomeFoodProvider(request);
    }

    @PostMapping("/{providerId}/menu-items")
    public ResponseEntity<?> addDish(@PathVariable String providerId, @RequestBody MenuItemRequestDTO dto) {
        System.out.println("DEBUG: HomeFoodController.addDish received request for provider: " + providerId);
        System.out.println("DEBUG: Payload: " + dto.getName() + ", " + dto.getPrice() + ", CategoryName: "
                + dto.getCategoryName());
        try {
            return ResponseEntity.ok(homeFoodService.addDish(providerId, dto));
        } catch (Exception e) {
            System.err.println("ERROR in HomeFoodController.addDish: " + e.getMessage());
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
