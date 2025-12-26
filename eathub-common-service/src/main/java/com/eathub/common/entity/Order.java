package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    private String sourceType; // "Restaurant" or "HomeFood"

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "home_food_provider_id")
    private HomeFoodProvider homeFoodProvider;

    private String currentStatusId; // Could be a many-to-one to OrderStatus

    @Column(name = "order_placed_at")
    private LocalDateTime orderPlacedAt;

    @Column(name = "expected_delivery_at")
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

    @Column(columnDefinition = "TEXT")
    private String orderNotes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private Set<OrderItem> items;

    @PrePersist
    protected void onOrder() {
        orderPlacedAt = LocalDateTime.now();
    }
}
