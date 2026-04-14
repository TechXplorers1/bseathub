package com.eathub.common.repository;

import com.eathub.common.entity.Chef;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChefRepository extends JpaRepository<Chef, String> {
    @Query("SELECT c FROM Chef c LEFT JOIN FETCH c.address LEFT JOIN FETCH c.legalProfile WHERE c.owner.id = :ownerId")
    Optional<Chef> findByOwnerId(String ownerId);

    @Query("SELECT c FROM Chef c LEFT JOIN FETCH c.address LEFT JOIN FETCH c.legalProfile WHERE c.slug = :slug")
    Optional<Chef> findBySlug(String slug);

    @Query("SELECT c FROM Chef c LEFT JOIN FETCH c.address LEFT JOIN FETCH c.legalProfile")
    List<Chef> findAllWithDetails();

    @Query("""
        SELECT c FROM Chef c 
        WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :title, '%'))
           OR LOWER(c.bio) LIKE LOWER(CONCAT('%', :title, '%'))
           OR LOWER(c.cuisines) LIKE LOWER(CONCAT('%', :title, '%'))
    """)
    List<Chef> findChefsByCategory(@Param("title") String title);
}