package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "home_food_providers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeFoodProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "brand_name")
    private String brandName;

    @Column(unique = true)
    private String slug;

    @Column(name = "food_type")
    private String foodType;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double rating;

    @Column(name = "reviews_count")
    private Integer reviewsCount;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "image_id")
    private String imageId;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
}
