package com.eathub.common.repository;

import com.eathub.common.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findTop50ByCustomer_IdOrderByOrderPlacedAtDesc(String customerId);
    List<Order> findTop50ByRestaurant_IdOrderByOrderPlacedAtDesc(String restaurantId);
    List<Order> findTop50ByHomeFoodProvider_IdOrderByOrderPlacedAtDesc(String homeFoodProviderId);
}
