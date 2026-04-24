package com.eathub.common.repository;

import com.eathub.common.entity.HomeFoodProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

@Repository
public interface HomeFoodProviderRepository extends JpaRepository<HomeFoodProvider, String> {
    @Query("SELECT h FROM HomeFoodProvider h LEFT JOIN FETCH h.address LEFT JOIN FETCH h.legalProfile WHERE h.slug = :slug")
    Optional<HomeFoodProvider> findBySlug(String slug);

    @Query("SELECT h FROM HomeFoodProvider h LEFT JOIN FETCH h.address LEFT JOIN FETCH h.legalProfile WHERE h.owner.id = :ownerId")
    Optional<HomeFoodProvider> findByOwnerId(String ownerId);

    @Query("SELECT h FROM HomeFoodProvider h LEFT JOIN FETCH h.address LEFT JOIN FETCH h.legalProfile LEFT JOIN FETCH h.categories mc LEFT JOIN FETCH mc.items")
    List<HomeFoodProvider> findAllWithDetails();
}
