package com.eathub.common.repository;

import com.eathub.common.entity.ChefAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ChefAddressRepository extends JpaRepository<ChefAddress, String> {
    Optional<ChefAddress> findByChef_Id(String chefId);
}
