package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "address", "legalProfile"})
@AllArgsConstructor
@Builder
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id; // Matches VARCHAR(36) in SQL

    @ManyToOne
@JoinColumn(name = "owner_id")
private User owner;


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

    @Column(name = "image_id")
    private String imageId;

    public void setCuisineType(String cuisineType) {
        this.cuisine = cuisineType;
    }

    public String getCuisineType() {
        return this.cuisine;
    }
}