package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "menu_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "restaurant_id") // Remove nullable = false if it can be a home-food item
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "home_food_id") // Add this field
    private HomeFoodProvider homeFood;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private MenuCategory category;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double price;
    private String imageId;
    private Boolean isSpecial;
    private String status;
}
