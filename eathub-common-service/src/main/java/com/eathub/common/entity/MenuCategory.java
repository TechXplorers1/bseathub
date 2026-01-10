package com.eathub.common.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "menu_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    @JsonBackReference // This tells Jackson NOT to include the restaurant again here
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "home_food_id")
    private HomeFoodProvider homeFood;

    private String title;

    // cascade = CascadeType.ALL is vital to save items automatically
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Allows items to be shown in Postman response
    private Set<MenuItem> items;
}