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
    private String id; // Matches VARCHAR(36) in SQL

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner; // Matches owner_id FK in SQL

    private String name;

    @Column(unique = true)
    private String slug;

    @Column(name = "restaurant_type") 
    private String type; 

    private String cuisine; // Matches 'cuisine' in SQL
    
    private Double rating;
    
    private Integer reviewsCount; // Matches 'reviews_count' in SQL
    
    private Integer avgDeliveryTime;
    
    private Double baseDeliveryFee;
    
    private Boolean isOpen;
    
    private String operationalStatus;

    @OneToOne(mappedBy = "restaurant", cascade = CascadeType.ALL)
    private RestaurantAddress address;

    @OneToOne(mappedBy = "restaurant", cascade = CascadeType.ALL)
    private RestaurantLegalProfile legalProfile;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Set<MenuCategory> menuCategories;

    @Column(columnDefinition = "TEXT")
    private String description;

    // --- Compatibility Helpers for RestaurantService ---

    /**
     * Alias for setCuisine to match RestaurantCreateRequestDTO logic
     * used in RestaurantService.registerRestaurant
     */
    public void setCuisineType(String cuisineType) {
        this.cuisine = cuisineType;
    }

    /**
     * Alias for getCuisine to match RestaurantResponseDTO logic
     * used in RestaurantService.mapToResponseDTO
     */
    public String getCuisineType() {
        return this.cuisine;
    }
}