package com.eathub.common.repository;

import com.eathub.common.entity.ChefBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChefBookingRepository extends JpaRepository<ChefBooking, String> {
    List<ChefBooking> findTop50ByChef_Id(String chefId);
    List<ChefBooking> findTop50ByCustomer_Id(String customerId);
    List<ChefBooking> findTop50ByChef_IdOrderByEventDateDesc(String chefId);
    List<ChefBooking> findTop50ByChef_IdOrderByCreatedAtDesc(String chefId);
    List<ChefBooking> findTop50ByCustomer_IdOrderByCreatedAtDesc(String customerId);
}
