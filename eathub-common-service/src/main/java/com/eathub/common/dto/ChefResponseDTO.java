package com.eathub.common.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChefResponseDTO {
    private String id;
    private String name;
    private String bio;
    private String experience;
    private String avatarUrl;
    private Double rating;
    private Integer reviews;
    // Fields required by your frontend ChefCard.tsx
    private String specialty; 
    private String preference; // Veg, Non-Veg, or Veg & Non-Veg
}