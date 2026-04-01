package com.eathub.common.service;

import com.eathub.common.dto.ReviewDTO.*;
import com.eathub.common.entity.Review;
import com.eathub.common.entity.User;
import com.eathub.common.repository.ReviewRepository;
import com.eathub.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    // ── Submit a new review ─────────────────────────────────────────────────
    @Transactional
    public ReviewResponse submitReview(ReviewRequest request) {

        if (request.getRating() == null || request.getRating() < 1.0 || request.getRating() > 5.0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }
        if (request.getTargetId() == null || request.getTargetId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target ID is required");
        }
        if (request.getTargetType() == null || request.getTargetType().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target type is required");
        }

        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        // Allow users to update their existing review instead of blocking
        Review review;
        String customerId = request.getCustomerId() != null ? request.getCustomerId() : "";
        String targetId   = request.getTargetId()   != null ? request.getTargetId()   : "";
        String mId        = request.getMenuItemId(); // null for provider review

        boolean alreadyReviewed = reviewRepository.existsByCustomer_IdAndTargetIdAndMenuItemId(customerId, targetId, mId);

        if (alreadyReviewed) {
            // Update the existing review
            String tType = request.getTargetType() != null ? request.getTargetType() : "";
            review = reviewRepository
                    .findByTargetIdAndTargetTypeOrderByCreatedAtDesc(targetId, tType)
                    .stream()
                    .filter(r -> r.getCustomer().getId().equals(customerId) && 
                            ( (mId == null && r.getMenuItemId() == null) || (mId != null && mId.equals(r.getMenuItemId())) ))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

            review.setRating(request.getRating());
            review.setComment(request.getComment());
            if(request.getOrderId() != null) {
                review.setOrderId(request.getOrderId());
            }
        } else {
            review = Review.builder()
                    .customer(customer)
                    .targetId(targetId)
                    .targetType(request.getTargetType() != null ? request.getTargetType() : "")
                    .rating(request.getRating())
                    .comment(request.getComment())
                    .orderId(request.getOrderId())
                    .menuItemId(request.getMenuItemId())
                    .menuItemName(request.getMenuItemName())
                    .build();
        }

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    // ── Get all reviews for a provider ─────────────────────────────────────
    public List<ReviewResponse> getReviewsForProvider(String targetId, String targetType) {
        return reviewRepository
                .findByTargetIdAndTargetTypeOrderByCreatedAtDesc(targetId, targetType)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get reviews for a specific item ───────────────────────────
    public List<ReviewResponse> getReviewsByMenuItemId(String menuItemId) {
        // Assuming you add a repository method for this
        return reviewRepository.findAll().stream()
                .filter(r -> menuItemId.equals(r.getMenuItemId()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get reviews submitted by a specific customer ────────────────────────
    public List<ReviewResponse> getReviewsByCustomer(String customerId) {
        return reviewRepository
                .findByCustomer_IdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Check if customer already reviewed a target ─────────────────────────
    public boolean hasAlreadyReviewed(String customerId, String targetId) {
        return reviewRepository.existsByCustomer_IdAndTargetIdAndMenuItemId(customerId, targetId, null);
    }

    public boolean hasAlreadyReviewed(String customerId, String targetId, String menuItemId) {
        return reviewRepository.existsByCustomer_IdAndTargetIdAndMenuItemId(customerId, targetId, menuItemId);
    }

    // ── Map entity → response DTO ────────────────────────────────────────────
    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .customerId(r.getCustomer().getId())
                .customerName(r.getCustomer().getName())
                .targetId(r.getTargetId())
                .targetType(r.getTargetType())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .orderId(r.getOrderId())
                .menuItemId(r.getMenuItemId())
                .menuItemName(r.getMenuItemName())
                .build();
    }
}
