package com.eathub.common.repository;

import com.eathub.common.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, String> {
    List<Favorite> findByUserId(String userId);
    List<Favorite> findByUserIdAndTargetType(String userId, String targetType);
    Optional<Favorite> findByUserIdAndTargetIdAndTargetType(String userId, String targetId, String targetType);
    void deleteByUserIdAndTargetIdAndTargetType(String userId, String targetId, String targetType);
    boolean existsByUserIdAndTargetIdAndTargetType(String userId, String targetId, String targetType);
}
