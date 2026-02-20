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
    private String avatarUrl;
    private String experience;

    @OneToMany(mappedBy = "chef", cascade = CascadeType.ALL)
    private Set<ChefService> services;
}
