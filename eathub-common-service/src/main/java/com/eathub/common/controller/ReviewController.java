package com.eathub.common.controller;

import com.eathub.common.dto.ReviewDTO.*;
import com.eathub.common.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * POST /api/v1/reviews
     * Submit a review after order delivery.
     * Body: { customerId, targetId, targetType, rating, comment }
     */
    @PostMapping
    public ResponseEntity<ReviewResponse> submitReview(@RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.submitReview(request));
    }

    /**
     * GET /api/v1/reviews/provider/{targetId}?type=Restaurant
     * Get all reviews for a restaurant / home-food / chef.
     */
    @GetMapping("/provider/{targetId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsForProvider(
            @PathVariable String targetId,
            @RequestParam String type) {
        return ResponseEntity.ok(reviewService.getReviewsForProvider(targetId, type));
    }

    /**
     * GET /api/v1/reviews/customer/{customerId}
     * Get all reviews submitted by a customer.
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByCustomer(
            @PathVariable String customerId) {
        return ResponseEntity.ok(reviewService.getReviewsByCustomer(customerId));
    }

    /**
     * GET /api/v1/reviews/check?customerId=xxx&targetId=yyy
     * Check if a customer has already reviewed a target.
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> hasAlreadyReviewed(
            @RequestParam String customerId,
            @RequestParam String targetId) {
        boolean reviewed = reviewService.hasAlreadyReviewed(customerId, targetId);
        return ResponseEntity.ok(Map.of("reviewed", reviewed));
    }
}
