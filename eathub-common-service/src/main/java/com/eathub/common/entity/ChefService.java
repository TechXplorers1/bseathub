package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chef_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChefService {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "chef_id", nullable = false)
    private Chef chef;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_price")
    private Double basePrice;

    private String category;

    @Column(name = "item_type")
    private String itemType;

    @Builder.Default
    @Column(name = "is_signature")
    private Boolean isSignature = false;

    @Builder.Default
    @Column(name = "is_negotiable")
    private Boolean isNegotiable = false;

    @Column(name = "image_id", columnDefinition = "TEXT")
    private String imageId;

    private String status;
}
