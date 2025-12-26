package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private String itemName;
    private String itemType; // "MenuItem" or "HomeFoodItem"
    private String itemRefId;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
}
