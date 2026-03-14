package com.eathub.common.repository;

import com.eathub.common.entity.RestaurantLegalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RestaurantLegalProfileRepository extends JpaRepository<RestaurantLegalProfile, String> {
    Optional<RestaurantLegalProfile> findByRestaurant_Id(String restaurantId);
}
