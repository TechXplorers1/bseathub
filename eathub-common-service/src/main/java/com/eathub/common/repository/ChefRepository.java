package com.eathub.common.repository;

import com.eathub.common.entity.Chef;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChefRepository extends JpaRepository<Chef, String> {
    Optional<Chef> findByOwnerId(String ownerId);
}