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

    @OneToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    private String brandName;
    private String description;
    private String foodType;
    private Double rating;
    private Integer reviewsCount;
    private Boolean isActive;
}
