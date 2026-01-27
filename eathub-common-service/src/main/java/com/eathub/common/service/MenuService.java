package com.eathub.common.service;

import com.eathub.common.dto.MenuItemDTO;
import com.eathub.common.entity.MenuItem;
import com.eathub.common.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    public List<MenuItemDTO> getItemsByCategory(String restaurantId, String categoryTitle) {
        // Fetch items filtering by both restaurant and category title
        List<MenuItem> items = menuItemRepository.findByRestaurantIdAndCategoryTitleIgnoreCase(restaurantId, categoryTitle);
        
        return items.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private MenuItemDTO convertToDTO(MenuItem item) {
        return MenuItemDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageId(item.getImageId())
                .isSpecial(item.getIsSpecial())
                .status(item.getStatus())
                .category(item.getCategory() != null ? item.getCategory().getTitle() : null)
                .build();
    }
    
    // Placeholder for your bulk import logic if you have one
    public void importMenu(Object categories) {
        // Implementation here
    }
}