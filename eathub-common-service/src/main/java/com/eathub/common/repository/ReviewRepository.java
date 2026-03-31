package com.eathub.common.repository;

import com.eathub.common.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {

    List<Review> findByTargetIdAndTargetTypeOrderByCreatedAtDesc(String targetId, String targetType);

    List<Review> findByCustomer_IdOrderByCreatedAtDesc(String customerId);

    boolean existsByCustomer_IdAndTargetId(String customerId, String targetId);
}
