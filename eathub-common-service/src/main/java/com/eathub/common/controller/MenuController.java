package com.eathub.common.controller;

import com.eathub.common.dto.MenuItemDTO;
import com.eathub.common.dto.MenuItemRequestDTO;
import com.eathub.common.dto.MenuResponseDTO;
import com.eathub.common.entity.MenuCategory;
import com.eathub.common.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/v1/menu")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:9004") 
public class MenuController {

    private final MenuService menuService;

    @PostMapping("/import")
    public ResponseEntity<String> importBulkMenu(@RequestBody List<MenuCategory> categories) {
        menuService.importMenu(categories);
        return ResponseEntity.ok("Menu imported successfully");
    }

    @GetMapping("/restaurant/{restaurantId}/category/{title}")
    public ResponseEntity<List<MenuItemDTO>> getItemsByCategory(
            @PathVariable String restaurantId,
            @PathVariable String title
    ) {
        try {
            List<MenuItemDTO> items = menuService.getItemsByCategory(restaurantId, title);

            if (items == null) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.out.println("Error in getItemsByCategory API: " + e.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/restaurants/{restaurantId}")
    public ResponseEntity<List<MenuItemDTO>> getItemsByRestaurant(
            @PathVariable String restaurantId
    ) {
        try {
            return ResponseEntity.ok(menuService.getItemsByRestaurant(restaurantId));
        } catch (Exception e) {
            System.out.println("Error getItemsByRestaurant: " + e.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PutMapping("/{id}")
    public MenuItemDTO update(
        @PathVariable String id,
        @RequestBody MenuItemRequestDTO dto
    ){
        return menuService.update(id, dto);
    }

    @PatchMapping("/{id}/featured")
    public void updateFeatured(@PathVariable String id, @RequestBody Map<String, Boolean> body){
        menuService.updateFeatured(id, body.get("isSpecial"));
    }

    @PatchMapping("/{id}/status")
    public void updateStatus(@PathVariable String id, @RequestBody Map<String, String> body){
        menuService.updateStatus(id, body.get("status"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id){
        menuService.delete(id);
    }
}
