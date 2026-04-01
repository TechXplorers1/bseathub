package com.eathub.common.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_orders_customer", columnList = "customer_id"),
    @Index(name = "idx_orders_restaurant", columnList = "restaurant_id"),
    @Index(name = "idx_orders_home_food", columnList = "home_food_provider_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(name = "source_type")
    private String sourceType; // "Restaurant" or "HomeFood"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_food_provider_id")
    private HomeFoodProvider homeFoodProvider;

    @Column(name = "current_status_id")
    private String currentStatusId; // Plain string status: Confirmed, Preparing, Out for Delivery, Delivered, Cancelled

    @Column(name = "order_placed_at")
    private LocalDateTime orderPlacedAt;

    @Column(name = "expected_delivery_at")
    private LocalDateTime expectedDeliveryAt;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "subtotal_amount")
    private Double subtotalAmount;

    @Column(name = "tax_amount")
    private Double taxAmount;

    @Column(name = "delivery_fee")
    private Double deliveryFee;

    @Column(name = "platform_fee")
    private Double platformFee;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "order_notes", columnDefinition = "TEXT")
    private String orderNotes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<OrderItem> items;

    @PrePersist
    protected void onOrder() {
        orderPlacedAt = LocalDateTime.now();
    }
}
