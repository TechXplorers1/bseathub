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
@CrossOrigin(origins = "*") // Allows your UI to connect to the backend
public class MenuController {
    private final MenuService menuService;

    @PostMapping("/import")
    public ResponseEntity<String> importBulkMenu(@RequestBody List<MenuCategory> categories) {
        menuService.importMenu(categories);
        return ResponseEntity.ok("Menu imported successfully from data.ts structure!");
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<MenuCategory> getRestaurantMenu(@PathVariable String restaurantId) {
        return menuService.getMenuByRestaurant(restaurantId);
    }

    @GetMapping("/home-food/{id}")
    public List<MenuCategory> getHomeFoodMenu(@PathVariable String id) {
        return menuService.getMenuByHomeFood(id);
    }
}