package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "home_food_providers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builderpublic HomeFoodProviderBuilder description(String description) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'description'");
    }
public class HomeFoodProvider {
    @Id
    private String id;

    @Column(name = "brand_name")
    private String brandName;

    @Column(unique = true)
    private String slug;

    @Column(name = "food_type")
    private String foodType;

    private Double rating;
    private Integer reviewsCount;
    private Boolean isActive;
    private String imageId;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    public static Object builder() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'builder'");
    }
}