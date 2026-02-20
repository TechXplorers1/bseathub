package com.eathub.common.service;

import com.eathub.common.dto.MenuItemDTO;
import com.eathub.common.dto.MenuItemRequestDTO;
import com.eathub.common.entity.MenuCategory;
import com.eathub.common.entity.MenuItem;
import com.eathub.common.entity.Restaurant;
import com.eathub.common.repository.MenuCategoryRepository;
import com.eathub.common.repository.MenuItemRepository;
import com.eathub.common.repository.RestaurantRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final RestaurantRepository restaurantRepository;

 @Transactional
public void importMenu(List<MenuCategory> categories) {
    for (MenuCategory category : categories) {
        // 1. Fetch the actual managed Restaurant entity from the DB
        // Assuming you have a RestaurantRepository injected
        String resId = category.getRestaurant().getId();
        Restaurant managedRestaurant = restaurantRepository.findById(resId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found: " + resId));

        category.setRestaurant(managedRestaurant); // Use the managed one

        if (category.getItems() != null) {
            category.getItems().forEach(item -> {
                item.setCategory(category);
                item.setRestaurant(managedRestaurant); // Link to managed restaurant
                
                if (item.getIsSpecial() == null) item.setIsSpecial(false);
                if (item.getStatus() == null) item.setStatus("Available");
            });
        }
    }
    menuCategoryRepository.saveAll(categories);
}

    // This handles single dish additions
    public MenuItemDTO addMenuItem(MenuItemRequestDTO request) {
        MenuCategory category = menuCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        MenuItem item = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .restaurant(category.getRestaurant())
                .isSpecial(false)
                .status("ACTIVE")
                .build();

        MenuItem saved = menuItemRepository.save(item);
        return mapToDTO(saved);
    }

    public List<MenuItemDTO> getAllMenuItems() {
        return menuItemRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private MenuItemDTO mapToDTO(MenuItem item) {
        return MenuItemDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .category(item.getCategory() != null ? item.getCategory().getTitle() : null)
                .status(item.getStatus())
                .isSpecial(item.getIsSpecial())
                .imageId(item.getImageId())
                .build();
    }
}