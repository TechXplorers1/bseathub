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
        if (categories == null)
            return;

        for (MenuCategory category : categories) {
            if (category.getItems() != null) {
                for (MenuItem item : category.getItems()) {
                    // CRITICAL: Link the item back to the category so 'category_id' is populated
                    item.setCategory(category);

                    // Sync the provider info from the category to the individual item
                    if (category.getRestaurant() != null) {
                        item.setRestaurant(category.getRestaurant());
                    }
                    if (category.getHomeFood() != null) {
                        item.setHomeFood(category.getHomeFood());
                    }
                }
            }
        }
        // Because of 'cascade = CascadeType.ALL' in MenuCategory,
        // saving the categories will automatically save all items into menu_items
        // table.
        menuCategoryRepository.saveAll(categories);
    }

    public List<MenuCategory> getMenuByRestaurant(String restaurantId) {
        return menuCategoryRepository.findByRestaurantId(restaurantId);
    }

    public List<MenuCategory> getMenuByHomeFood(String homeFoodId) {
        return menuCategoryRepository.findByHomeFoodId(homeFoodId);
    }
}