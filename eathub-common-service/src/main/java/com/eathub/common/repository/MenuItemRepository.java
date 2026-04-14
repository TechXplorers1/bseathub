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

    // Standard fetch
    List<MenuItem> findByRestaurantId(String restaurantId);

    List<MenuItem> findByHomeFood_Id(String homeFoodId);

    @Query("SELECT mi FROM MenuItem mi LEFT JOIN FETCH mi.category WHERE mi.homeFood.id = :homeFoodId")
    List<MenuItem> findByHomeFoodIdEager(@Param("homeFoodId") String homeFoodId);

    List<MenuItem> findByRestaurantIdAndCategory_TitleIgnoreCase(String restaurantId, String title);

    // Discovery Queries - Uses JOIN FETCH to ensure provider info is available for the frontend mapping
    
    @Query("""
                SELECT DISTINCT r FROM Restaurant r
                JOIN r.menuCategories c
                JOIN c.items mi
                WHERE (LOWER(c.title) LIKE LOWER(CONCAT('%', :title, '%'))
                   OR LOWER(mi.name) LIKE LOWER(CONCAT('%', :title, '%'))
                   OR LOWER(mi.description) LIKE LOWER(CONCAT('%', :title, '%')))
            """)
    List<Restaurant> findRestaurantsByCategory(@Param("title") String title);

    @Query("""
                SELECT DISTINCT hf FROM HomeFoodProvider hf
                JOIN hf.categories c
                JOIN c.items mi
                WHERE (LOWER(c.title) LIKE LOWER(CONCAT('%', :title, '%'))
                   OR LOWER(mi.name) LIKE LOWER(CONCAT('%', :title, '%'))
                   OR LOWER(mi.description) LIKE LOWER(CONCAT('%', :title, '%')))
            """)
    List<HomeFoodProvider> findHomeFoodProvidersByCategory(@Param("title") String title);

    @Query("""
                SELECT mi FROM MenuItem mi
                LEFT JOIN FETCH mi.category c
                LEFT JOIN FETCH mi.restaurant r
                LEFT JOIN FETCH mi.homeFood hf
                WHERE (LOWER(c.title) LIKE LOWER(CONCAT('%', :title, '%'))
                   OR LOWER(mi.name) LIKE LOWER(CONCAT('%', :title, '%'))
                   OR LOWER(mi.description) LIKE LOWER(CONCAT('%', :title, '%')))
            """)
    List<MenuItem> findMenuItemsByCategory(@Param("title") String title);
}