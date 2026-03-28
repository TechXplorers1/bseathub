package com.eathub.common.entity;

import java.util.Set;

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

    @Column(name = "delivery_availability")
    private String deliveryAvailability;

    @Column(name = "specialty_dishes", columnDefinition = "TEXT")
    private String specialtyDishes;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double rating;

    @Column(name = "reviews_count")
    private Integer reviewsCount;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "image_id", columnDefinition = "TEXT")
    private String imageId;

    @Column(name = "cover_image_id", columnDefinition = "TEXT")
    private String coverImageId;

    @Column(name = "working_hours", columnDefinition = "TEXT")
    private String workingHours;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "country_code")
    private String countryCode;

    @Column(name = "cuisines", columnDefinition = "TEXT")
    private String cuisines;

    @Column(name = "operational_status")
    private String operationalStatus;

    // Relationships
    @OneToOne(mappedBy = "homeFoodProvider", cascade = CascadeType.ALL)
    private HomeFoodAddress address;

    @OneToOne(mappedBy = "homeFoodProvider", cascade = CascadeType.ALL)
    private HomeFoodLegalProfile legalProfile;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner; // Change String to User

    @OneToMany(mappedBy = "homeFoodProvider", cascade = CascadeType.ALL)
    private Set<MenuCategory> categories;
}
