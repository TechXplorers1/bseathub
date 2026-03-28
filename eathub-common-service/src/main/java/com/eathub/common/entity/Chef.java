package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "chefs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chef {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne
    @JoinColumn(name = "owner_id") // Use @JoinColumn for associations
    private User owner;

    private String name;
    private String slug;      
    private String specialty;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Double rating;
    private Integer reviewsCount;
    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "cover_image_id", columnDefinition = "TEXT")
    private String coverImageId;

    private String experience;

    @Column(name = "base_price")
    private Double basePrice;

    @Column(name = "work_type")
    private String workType;

    @Column(name = "social_links")
    private String socialLinks;

    @Column(columnDefinition = "TEXT")
    private String workingHours;
    
    private Boolean isActive;

    @OneToOne(mappedBy = "chef", cascade = CascadeType.ALL)
    private ChefAddress address;

    @OneToOne(mappedBy = "chef", cascade = CascadeType.ALL)
    private ChefLegalProfile legalProfile;

    @OneToMany(mappedBy = "chef", cascade = CascadeType.ALL)
    private Set<ChefService> services;
}
