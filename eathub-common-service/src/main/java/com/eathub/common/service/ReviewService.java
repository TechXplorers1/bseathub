package com.eathub.common.service;

import com.eathub.common.dto.ReviewDTO.*;
import com.eathub.common.entity.*;
import com.eathub.common.repository.ReviewRepository;
import com.eathub.common.repository.UserRepository;
import com.eathub.common.repository.ChefRepository;
import com.eathub.common.repository.RestaurantRepository;
import com.eathub.common.repository.HomeFoodProviderRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ChefRepository chefRepository;
    private final RestaurantRepository restaurantRepository;
    private final HomeFoodProviderRepository homeFoodRepository;
    private final FirebaseService firebaseService;
    private final NotificationHistoryService notificationHistoryService;

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
        String targetId = request.getTargetId() != null ? request.getTargetId() : "";
        String mId = request.getMenuItemId(); // null for provider review

        boolean alreadyReviewed = reviewRepository.existsByCustomer_IdAndTargetIdAndMenuItemId(customerId, targetId, mId);

        if (alreadyReviewed) {
            // Update the existing review
            String tType = request.getTargetType() != null ? request.getTargetType() : "";
            review = reviewRepository
                    .findByTargetIdAndTargetTypeOrderByCreatedAtDesc(targetId, tType)
                    .stream()
                    .filter(r -> r.getCustomer().getId().equals(customerId)
                    && ((mId == null && r.getMenuItemId() == null) || (mId != null && mId.equals(r.getMenuItemId()))))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

            review.setRating(request.getRating());
            review.setComment(request.getComment());
            if (request.getOrderId() != null) {
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

        // Update Provider Rating
        updateProviderRating(targetId, request.getTargetType());

        // ── Notify Provider of New Review ───────────────────────────
        try {
            User owner = null;
            if ("Chef".equalsIgnoreCase(saved.getTargetType())) {
                owner = chefRepository.findById(targetId).map(Chef::getOwner).orElse(null);
            } else if ("Restaurant".equalsIgnoreCase(saved.getTargetType())) {
                owner = restaurantRepository.findById(targetId).map(Restaurant::getOwner).orElse(null);
            } else if ("HomeFood".equalsIgnoreCase(saved.getTargetType())) {
                owner = homeFoodRepository.findById(targetId).map(HomeFoodProvider::getOwner).orElse(null);
            }

            if (owner != null && owner.getFcmToken() != null) {
                String title = "New Review Received! ⭐";
                String body = saved.getCustomer().getName() + " gave you a " + saved.getRating() + "-star review.";
                
                java.util.Map<String, String> data = new java.util.HashMap<>();
                data.put("reviewId", saved.getId());
                data.put("action", "NEW_REVIEW");

                Notification n = notificationHistoryService.saveNotification(owner.getId(), title, body, "REVIEW", saved.getId());
                if (n != null) {
                    data.put("id", n.getId());
                    data.put("type", "REVIEW");
                    data.put("referenceId", saved.getId());
                }
                firebaseService.sendNotification(owner.getFcmToken(), title, body, data);
            }
        } catch (Exception e) {
            System.err.println("Failed to notify provider of new review: " + e.getMessage());
        }

        return toResponse(saved);
    }

    private void updateProviderRating(String targetId, String targetType) {
        List<Review> reviews = reviewRepository.findByTargetIdAndTargetTypeOrderByCreatedAtDesc(targetId, targetType);
        double avgRating = reviews.stream().mapToDouble(Review::getRating).average().orElse(0.0);
        int count = reviews.size();

        if ("Chef".equalsIgnoreCase(targetType)) {
            chefRepository.findById(targetId).ifPresent(chef -> {
                chef.setRating(avgRating);
                chef.setReviewsCount(count);
                chefRepository.save(chef);
            });
        } else if ("Restaurant".equalsIgnoreCase(targetType)) {
            restaurantRepository.findById(targetId).ifPresent(rest -> {
                rest.setRating(avgRating);
                rest.setReviewsCount(count);
                restaurantRepository.save(rest);
            });
        } else if ("HomeFood".equalsIgnoreCase(targetType)) {
            homeFoodRepository.findById(targetId).ifPresent(hf -> {
                hf.setRating(avgRating);
                hf.setReviewsCount(count);
                homeFoodRepository.save(hf);
            });
        }
    }

    // ── Get all reviews for a provider ─────────────────────────────────────
    public List<ReviewResponse> getReviewsForProvider(String targetId, String type) {
        return reviewRepository.findByTargetIdAndTargetTypeOrderByCreatedAtDesc(targetId, type)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsForOwner(String ownerId, String type) {
        String targetId = ownerId;
        if ("Chef".equalsIgnoreCase(type)) {
            Chef chef = chefRepository.findByOwnerId(ownerId)
                    .orElseThrow(() -> new RuntimeException("Chef not found for owner: " + ownerId));
            targetId = chef.getId();
        } else if ("Restaurant".equalsIgnoreCase(type)) {
            Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found for owner: " + ownerId));
            targetId = restaurant.getId();
        } else if ("HomeFood".equalsIgnoreCase(type) || "HomeFoodProvider".equalsIgnoreCase(type)) {
            HomeFoodProvider hfp = homeFoodRepository.findByOwnerId(ownerId)
                    .orElseThrow(() -> new RuntimeException("HomeFood provider not found for owner: " + ownerId));
            targetId = hfp.getId();
        }
        return getReviewsForProvider(targetId, type);
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

    public boolean hasAlreadyReviewedByOrder(String orderId) {
        return reviewRepository.existsByOrderId(orderId);
    }

    @Transactional
    public ReviewResponse addReply(ReplyRequest request) {
        Review review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        review.setReply(request.getReply());
        review.setRepliedAt(LocalDateTime.now());
        Review saved = reviewRepository.save(review);
        
        // ── Notify Customer of Reply ───────────────────────────────
        try {
            User customer = saved.getCustomer();
            if (customer != null && customer.getFcmToken() != null) {
                String title = "Provider Replied to your Review! 💬";
                String body = "You received a response to your " + saved.getTargetType() + " review.";
                
                java.util.Map<String, String> data = new java.util.HashMap<>();
                data.put("reviewId", saved.getId());
                data.put("action", "REVIEW_REPLY");

                Notification n = notificationHistoryService.saveNotification(customer.getId(), title, body, "REVIEW", saved.getId());
                if (n != null) {
                    data.put("id", n.getId());
                    data.put("type", "REVIEW");
                    data.put("referenceId", saved.getId());
                }
                firebaseService.sendNotification(customer.getFcmToken(), title, body, data);
            }
        } catch (Exception e) {
            System.err.println("Failed to notify customer of review reply: " + e.getMessage());
        }

        return toResponse(saved);
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
                .reply(r.getReply())
                .repliedAt(r.getRepliedAt())
                .build();
    }
}
