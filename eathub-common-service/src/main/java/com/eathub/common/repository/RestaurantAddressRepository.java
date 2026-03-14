package com.eathub.common.repository;

import com.eathub.common.entity.RestaurantAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RestaurantAddressRepository extends JpaRepository<RestaurantAddress, String> {
    Optional<RestaurantAddress> findByRestaurant_Id(String restaurantId);
}
