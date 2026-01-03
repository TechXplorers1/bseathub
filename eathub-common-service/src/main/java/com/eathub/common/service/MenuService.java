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
        for (MenuCategory category : categories) {
            if (category.getItems() != null) {
                for (MenuItem item : category.getItems()) {
                    item.setCategory(category);
                    // Link to the same provider as the category
                    item.setRestaurant(category.getRestaurant());
                    item.setHomeFood(category.getHomeFood());
                }
            }
        }
        menuCategoryRepository.saveAll(categories);
    }

    public List<MenuCategory> getMenuByRestaurant(String restaurantId) {
        return menuCategoryRepository.findByRestaurantId(restaurantId);
    }

    public List<MenuCategory> getMenuByHomeFood(String homeFoodId) {
        return menuCategoryRepository.findByHomeFoodId(homeFoodId);
    }
}