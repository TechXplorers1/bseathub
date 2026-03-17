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
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    // ── Core ──────────────────────────────────────────────────────────────
    private String name;

    @Column(unique = true)
    private String slug;

    @Column(name = "restaurant_type")
    private String type;

    private String cuisine;
    private Double rating;
    private Integer reviewsCount;
    private Integer avgDeliveryTime;
    private Double baseDeliveryFee;
    private Boolean isOpen;
    private String operationalStatus;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_id", columnDefinition = "TEXT")
    private String imageId;

    @Column(name = "cover_image_id", columnDefinition = "TEXT")
    private String coverImageId;

    // ── Relationships (Reverted to 3-Table Structure) ───────────────────────
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id")
    private RestaurantAddress address;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "legal_profile_id")
    private RestaurantLegalProfile legalProfile;

    // ── Menu Categories (unchanged) ────────────────────────────────────────
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Set<MenuCategory> menuCategories;

    // Convenience alias methods for cuisine
    public void setCuisineType(String cuisineType) {
        this.cuisine = cuisineType;
    }

    public String getCuisineType() {
        return this.cuisine;
    }
}