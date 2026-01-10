package com.eathub.common.controller;

import com.eathub.common.entity.MenuCategory;
import com.eathub.common.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/menu")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class MenuController {
    private final MenuService menuService;

    @PostMapping("/import")
    public ResponseEntity<String> importBulkMenu(@RequestBody List<MenuCategory> categories) {
        try {
            menuService.importMenu(categories);
            return ResponseEntity.ok("Menu imported successfully and saved to DBeaver!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuCategory>> getRestaurantMenu(@PathVariable String restaurantId) {
        return ResponseEntity.ok(menuService.getMenuByRestaurant(restaurantId));
    }

    @GetMapping("/home-food/{id}")
    public ResponseEntity<List<MenuCategory>> getHomeFoodMenu(@PathVariable String id) {
        return ResponseEntity.ok(menuService.getMenuByHomeFood(id));
    }
}