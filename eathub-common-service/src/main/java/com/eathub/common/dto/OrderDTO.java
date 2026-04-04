package com.eathub.common.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderRequest {
        @JsonProperty("customerId")
        private String customerId;
        @JsonProperty("sourceType")
        private String sourceType;
        @JsonProperty("sourceId")
        private String sourceId;
        @JsonProperty("deliveryAddress")
        private String deliveryAddress;
        @JsonProperty("subtotalAmount")
        private Double subtotalAmount;
        @JsonProperty("taxAmount")
        private Double taxAmount;
        @JsonProperty("deliveryFee")
        private Double deliveryFee;
        @JsonProperty("platformFee")
        private Double platformFee;
        @JsonProperty("discountAmount")
        private Double discountAmount;
        @JsonProperty("totalAmount")
        private Double totalAmount;
        @JsonProperty("paymentMethod")
        private String paymentMethod;
        @JsonProperty("paymentStatus")
        private String paymentStatus;
        @JsonProperty("orderNotes")
        private String orderNotes;
        @JsonProperty("items")
        private List<OrderItemRequest> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {
        @JsonProperty("itemName")
        private String itemName;
        @JsonProperty("itemType")
        private String itemType;
        @JsonProperty("itemRefId")
        private String itemRefId;
        @JsonProperty("quantity")
        private Integer quantity;
        @JsonProperty("unitPrice")
        private Double unitPrice;
        @JsonProperty("totalPrice")
        private Double totalPrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderResponse {
        @JsonProperty("id")
        private String id;
        @JsonProperty("customerId")
        private String customerId;
        @JsonProperty("customerName")
        private String customerName;
        @JsonProperty("sourceType")
        private String sourceType;
        @JsonProperty("sourceId")
        private String sourceId;
        @JsonProperty("sourceName")
        private String sourceName;
        @JsonProperty("currentStatusId")
        private String currentStatusId;
        @JsonProperty("orderPlacedAt")
        private LocalDateTime orderPlacedAt;
        @JsonProperty("expectedDeliveryAt")
        private LocalDateTime expectedDeliveryAt;
        @JsonProperty("deliveryAddress")
        private String deliveryAddress;
        @JsonProperty("subtotalAmount")
        private Double subtotalAmount;
        @JsonProperty("taxAmount")
        private Double taxAmount;
        @JsonProperty("deliveryFee")
        private Double deliveryFee;
        @JsonProperty("platformFee")
        private Double platformFee;
        @JsonProperty("discountAmount")
        private Double discountAmount;
        @JsonProperty("totalAmount")
        private Double totalAmount;
        @JsonProperty("paymentMethod")
        private String paymentMethod;
        @JsonProperty("paymentStatus")
        private String paymentStatus;
        @JsonProperty("orderNotes")
        private String orderNotes;
        @JsonProperty("cancellationReason")
        private String cancellationReason;
        @JsonProperty("cancelledBy")
        private String cancelledBy;
        @JsonProperty("items")
        private List<OrderItemResponse> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        @JsonProperty("id")
        private String id;
        @JsonProperty("itemName")
        private String itemName;
        @JsonProperty("itemType")
        private String itemType;
        @JsonProperty("itemRefId")
        private String itemRefId;
        @JsonProperty("quantity")
        private Integer quantity;
        @JsonProperty("unitPrice")
        private Double unitPrice;
        @JsonProperty("totalPrice")
        private Double totalPrice;
    }
}
