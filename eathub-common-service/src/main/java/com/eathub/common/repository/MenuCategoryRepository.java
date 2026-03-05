package com.eathub.common.repository;

import com.eathub.common.entity.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, String> {

    List<MenuCategory> findByRestaurant_Id(String restaurantId);

    List<MenuCategory> findByHomeFoodProvider_Id(String homeFoodId);

    Optional<MenuCategory> findByRestaurant_IdAndTitleIgnoreCase(
            String restaurantId,
            String title
    );

    Optional<MenuCategory> findByHomeFoodProvider_IdAndTitleIgnoreCase(
            String homeFoodId,
            String title
    );

    Optional<MenuCategory> findByTitle(String title);
}