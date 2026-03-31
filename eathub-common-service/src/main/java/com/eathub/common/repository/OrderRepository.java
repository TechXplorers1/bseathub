package com.eathub.common.repository;

import com.eathub.common.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByCustomer_IdOrderByOrderPlacedAtDesc(String customerId);
    List<Order> findByRestaurant_IdOrderByOrderPlacedAtDesc(String restaurantId);
    List<Order> findByHomeFoodProvider_IdOrderByOrderPlacedAtDesc(String homeFoodProviderId);
}
