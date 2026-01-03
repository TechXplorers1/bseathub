package com.eathub.common.entity;

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
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "home_food_id")
    private HomeFoodProvider homeFood;

    private String title;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private Set<MenuItem> items;
}
