package com.eathub.common.service;

import com.eathub.common.dto.MenuItemDTO;
import com.eathub.common.dto.MenuItemRequestDTO;
import com.eathub.common.dto.MenuResponseDTO;
import com.eathub.common.entity.MenuCategory;
import com.eathub.common.entity.MenuItem;
import com.eathub.common.entity.Restaurant;
import com.eathub.common.repository.HomeFoodProviderRepository;
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
    private final HomeFoodProviderRepository homeFoodProviderRepository;

    // ================= IMPORT MENU =================

    @Transactional
    public void importMenu(List<MenuCategory> categories) {
        for (MenuCategory category : categories) {

            String resId = category.getRestaurant().getId();
            Restaurant managedRestaurant = restaurantRepository.findById(resId)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found: " + resId));

            category.setRestaurant(managedRestaurant);

            if (category.getItems() != null) {
                category.getItems().forEach(item -> {
                    item.setCategory(category);
                    item.setRestaurant(managedRestaurant);

                    if (item.getIsSpecial() == null)
                        item.setIsSpecial(false);
                    if (item.getStatus() == null)
                        item.setStatus("Available");
                });
            }
        }

        menuCategoryRepository.saveAll(categories);
    }

    // ================= ADD RESTAURANT ITEM =================

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

        return mapToDTO(menuItemRepository.save(item));
    }

    // ================= FETCH =================

    public List<MenuItemDTO> getItemsByCategory(String restaurantId, String title) {
        return menuItemRepository
                .findByRestaurantIdAndCategory_TitleIgnoreCase(restaurantId, title)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MenuItemDTO> getItemsByRestaurant(String restaurantId) {
        return menuItemRepository
                .findByRestaurantId(restaurantId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MenuItemDTO> getItemsByHomeFood(String homeFoodId) {
        return menuItemRepository
                .findByHomeFood_Id(homeFoodId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<com.eathub.common.dto.MenuCategoryDTO> getGroupedMenu(String providerId, String type) {
        List<MenuItem> items;
        if ("restaurant".equalsIgnoreCase(type)) {
            items = menuItemRepository.findByRestaurantId(providerId);
        } else {
            items = menuItemRepository.findByHomeFood_Id(providerId);
        }

        return items.stream()
                .collect(Collectors.groupingBy(
                        item -> item.getCategory() != null ? item.getCategory().getTitle() : "Uncategorized",
                        Collectors.mapping(this::mapToDTO, Collectors.toList())))
                .entrySet().stream()
                .map(entry -> com.eathub.common.dto.MenuCategoryDTO.builder()
                        .title(entry.getKey())
                        .items(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    // ================= UPDATE =================

    public MenuItemDTO update(String id, MenuItemRequestDTO dto) {

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setPrice(dto.getPrice());
        item.setIsSpecial(dto.getIsSpecial());
        item.setStatus(dto.getStatus());
        item.setImageId(dto.getImageUrl());

        if (dto.getCategoryName() != null && !dto.getCategoryName().isEmpty()) {
            // Attempt to find or create category logic similar to HomeFoodService
            // For now, let's at least ensure imageId is updated
        }

        return mapToDTO(menuItemRepository.save(item));
    }

    public void updateFeatured(String id, Boolean isSpecial) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        item.setIsSpecial(isSpecial);
        menuItemRepository.save(item);
    }

    public void updateStatus(String id, String status) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        item.setStatus(status);
        menuItemRepository.save(item);
    }

    public void delete(String id) {
        menuItemRepository.deleteById(id);
    }

    // ================= MAPPERS =================

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

    private MenuResponseDTO mapToResponse(MenuItem item) {

        MenuResponseDTO.MenuResponseDTOBuilder builder = MenuResponseDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .status(item.getStatus())
                .isSpecial(item.getIsSpecial())
                .category(item.getCategory() != null ? item.getCategory().getTitle() : null);

        if (item.getRestaurant() != null) {
            builder.providerId(item.getRestaurant().getId())
                    .providerName(item.getRestaurant().getName())
                    .providerType("RESTAURANT");
        } else if (item.getHomeFood() != null) {
            builder.providerId(item.getHomeFood().getId())
                    .providerName(item.getHomeFood().getBrandName())
                    .providerType("HOMEFOOD");
        }

        return builder.build();
    }
}