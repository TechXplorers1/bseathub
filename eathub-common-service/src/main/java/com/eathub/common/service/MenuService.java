package com.eathub.common.service;

import com.eathub.common.entity.MenuCategory;
import com.eathub.common.entity.MenuItem;
import com.eathub.common.repository.MenuCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {
    private final MenuCategoryRepository menuCategoryRepository;

    @Transactional
    public void importMenu(List<MenuCategory> categories) {
        if (categories == null || categories.isEmpty()) {
            return;
        }

        for (MenuCategory category : categories) {
            if (category.getItems() != null) {
                for (MenuItem item : category.getItems()) {
                    // LINKING STEP: This ensures the category_id is populated in the database
                    item.setCategory(category);

                    // Sync ownership data from category to individual items
                    if (category.getRestaurant() != null) {
                        item.setRestaurant(category.getRestaurant());
                    }
                    if (category.getHomeFood() != null) {
                        item.setHomeFood(category.getHomeFood());
                    }
                }
            }
        }
        // Saving the categories will automatically save all items due to CascadeType.ALL
        menuCategoryRepository.saveAll(categories);
    }

    public List<MenuCategory> getMenuByRestaurant(String restaurantId) {
        return menuCategoryRepository.findByRestaurantId(restaurantId);
    }

    public List<MenuCategory> getMenuByHomeFood(String homeFoodId) {
        return menuCategoryRepository.findByHomeFoodId(homeFoodId);
    }
}