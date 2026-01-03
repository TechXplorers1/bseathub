package com.eathub.common.repository;

import com.eathub.common.entity.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, String> {
    // Fetches categories for a specific restaurant to display on its menu page
    List<MenuCategory> findByRestaurantId(String restaurantId);

    // Fetches categories for a specific home food provider
    List<MenuCategory> findByHomeFoodId(String homeFoodId);
}