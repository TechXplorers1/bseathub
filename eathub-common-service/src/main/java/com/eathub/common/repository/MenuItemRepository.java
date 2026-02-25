package com.eathub.common.repository;

import com.eathub.common.entity.HomeFoodProvider;
import com.eathub.common.entity.MenuItem;
import com.eathub.common.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, String> {

    List<MenuItem> findByRestaurantId(String restaurantId);

    // Keep this for standard menu fetching
    List<MenuItem> findByRestaurantIdAndCategoryTitleIgnoreCase(String restaurantId, String title);

    // New Discovery Queries
    @Query("""
        SELECT DISTINCT mi.restaurant FROM MenuItem mi 
        WHERE LOWER(mi.category.title) = LOWER(:title) 
        AND mi.restaurant IS NOT NULL
    """)
    List<Restaurant> findRestaurantsByCategory(@Param("title") String title);

    @Query("""
        SELECT DISTINCT mi.homeFood FROM MenuItem mi 
        WHERE LOWER(mi.category.title) = LOWER(:title) 
        AND mi.homeFood IS NOT NULL
    """)
    List<HomeFoodProvider> findHomeFoodProvidersByCategory(@Param("title") String title);
}