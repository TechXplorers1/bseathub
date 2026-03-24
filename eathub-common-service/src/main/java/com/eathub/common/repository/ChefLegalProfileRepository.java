package com.eathub.common.repository;

import com.eathub.common.entity.ChefLegalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ChefLegalProfileRepository extends JpaRepository<ChefLegalProfile, String> {
    Optional<ChefLegalProfile> findByChef_Id(String chefId);
}
