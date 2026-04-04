package com.eathub.common.repository;

import com.eathub.common.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderStatusRepository extends JpaRepository<OrderStatus, String> {
    Optional<OrderStatus> findByCode(String code);
}
