package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chef_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChefBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne
    @JoinColumn(name = "chef_id", nullable = false)
    private Chef chef;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private ChefService service;

    @Column(name = "event_date")
    private LocalDateTime eventDate;

    private Integer guests;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Builder.Default
    private String status = "Pending"; // Pending, Confirmed, Completed, Cancelled

    @Column(name = "payment_status")
    @Builder.Default
    private String paymentStatus = "Unpaid";

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @Column(name = "event_address", columnDefinition = "TEXT")
    private String eventAddress;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "status_reason", columnDefinition = "TEXT")
    private String statusReason;

    @Column(name = "event_type")
    private String eventType;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "food_preference")
    private String foodPreference; // Veg, Non-Veg, Both

    @Column(name = "is_negotiable")
    @Builder.Default
    private Boolean isNegotiable = false;
}
