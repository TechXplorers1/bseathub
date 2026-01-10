package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    private String name;

    @Column(unique = true)
    private String slug;

    // Fix: Explicitly define the column name to prevent collision with Hibernate keywords
    @Column(name = "restaurant_type") 
    private String type; 

    private String cuisine;
    private Double rating;
    private Integer reviewsCount;
    private Integer avgDeliveryTime;
    private Double baseDeliveryFee;
    private Boolean isOpen;
    private String operationalStatus;

    @OneToOne(mappedBy = "restaurant", cascade = CascadeType.ALL)
    private RestaurantAddress address;

    @OneToOne(mappedBy = "restaurant", cascade = CascadeType.ALL)
    private RestaurantLegalProfile legalProfile;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    @JsonManagedReference // This tells Jackson to include the categories
    private Set<MenuCategory> menuCategories;
}