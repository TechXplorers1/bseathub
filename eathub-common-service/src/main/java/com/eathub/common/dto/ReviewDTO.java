package com.eathub.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ReviewDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewRequest {
        private String customerId; // user ID (from localStorage or JWT)
        private String targetId; // restaurant / home-food / chef ID
        private String targetType; // "Restaurant" | "HomeFood" | "Chef" | "MenuItem"
        private Double rating; // 1.0 – 5.0
        private String comment; // free-text review
        private String orderId; // To tie the review to the specific order
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewResponse {
        private String id;
        private String customerId;
        private String customerName;
        private String targetId;
        private String targetType;
        private Double rating;
        private String comment;
        private LocalDateTime createdAt;
        private String orderId;
    }
}
