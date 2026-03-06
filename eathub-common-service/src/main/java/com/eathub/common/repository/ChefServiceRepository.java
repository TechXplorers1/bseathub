package com.eathub.common.repository;

import com.eathub.common.entity.ChefService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChefServiceRepository extends JpaRepository<ChefService, String> {
    List<ChefService> findByChef_Id(String chefId);
}
