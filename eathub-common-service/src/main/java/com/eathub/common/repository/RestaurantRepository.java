package com.eathub.common.repository;

import com.eathub.common.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, String> {
    @Query("SELECT r FROM Restaurant r LEFT JOIN FETCH r.address LEFT JOIN FETCH r.legalProfile WHERE r.slug = :slug")
    Optional<Restaurant> findBySlug(String slug);

    @Query("SELECT r FROM Restaurant r LEFT JOIN FETCH r.address LEFT JOIN FETCH r.legalProfile WHERE r.owner.id = :ownerId")
    Optional<Restaurant> findByOwnerId(String ownerId);

    @Query("SELECT r FROM Restaurant r LEFT JOIN FETCH r.address LEFT JOIN FETCH r.legalProfile")
    List<Restaurant> findAllWithDetails();
}
