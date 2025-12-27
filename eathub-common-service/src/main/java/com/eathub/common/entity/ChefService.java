package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chef_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChefService {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "chef_id", nullable = false)
    private Chef chef;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double basePrice;
    private String status;
}
