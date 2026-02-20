package com.eathub.common.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonBackReference
    private MenuCategory category;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_food_id")
    @JsonIgnoreProperties({"categories", "menuItems"}) // Add this line
    private HomeFoodProvider homeFood;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double price;
    private String imageId;
    private Boolean isSpecial;
    private String status;
}