package com.eathub.common.repository;

import com.eathub.common.entity.ChefBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChefBookingRepository extends JpaRepository<ChefBooking, String> {
    List<ChefBooking> findByChef_Id(String chefId);
    List<ChefBooking> findByCustomer_Id(String customerId);
    List<ChefBooking> findByChef_IdOrderByEventDateDesc(String chefId);
    List<ChefBooking> findByChef_IdOrderByCreatedAtDesc(String chefId);
    List<ChefBooking> findByCustomer_IdOrderByCreatedAtDesc(String customerId);
}
