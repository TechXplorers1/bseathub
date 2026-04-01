package com.eathub.common.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderRequest {
        private String customerId;
        private String sourceType; // "Restaurant" or "HomeFood"
        private String sourceId; // id of the Restaurant or HomeFoodProvider

        private String deliveryAddress;
        private Double subtotalAmount;
        private Double taxAmount;
        private Double deliveryFee;
        private Double platformFee;
        private Double discountAmount;
        private Double totalAmount;

        private String paymentMethod;
        private String paymentStatus;
        private String orderNotes;

        private List<OrderItemRequest> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {
        private String itemName;
        private String itemType; // "MenuItem" or "HomeFoodItem"
        private String itemRefId;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderResponse {
        private String id;
        private String customerId;
        private String customerName;
        private String sourceType;
        private String sourceId;
        private String sourceName;
        private String currentStatusId;
        private LocalDateTime orderPlacedAt;
        private LocalDateTime expectedDeliveryAt;

        private String deliveryAddress;

        private Double subtotalAmount;
        private Double taxAmount;
        private Double deliveryFee;
        private Double platformFee;
        private Double discountAmount;
        private Double totalAmount;

        private String paymentMethod;
        private String paymentStatus;
        private String orderNotes;

        private List<OrderItemResponse> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private String id;
        private String itemName;
        private String itemType;
        private String itemRefId;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;
    }
}
