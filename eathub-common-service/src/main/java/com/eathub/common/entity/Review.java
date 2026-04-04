package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    private String targetId; // ID of Restaurant, HomeFood, or Chef
    private String targetType; // "Restaurant", "HomeFood", "Chef"

    private Double rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private String orderId;
    private String menuItemId; // For item-specific reviews
    private String menuItemName; // For item-specific reviews

    private LocalDateTime createdAt;
    
    @Column(columnDefinition = "TEXT")
    private String reply;
    private LocalDateTime repliedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
