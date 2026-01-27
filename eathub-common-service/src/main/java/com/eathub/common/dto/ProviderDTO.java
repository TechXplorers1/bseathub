package com.eathub.common.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderDTO {
    private String id;
    private String name;        // Maps from Restaurant.name, HomeFood.brandName, or Chef.name
    private String providerType;// "RESTAURANT", "HOME_FOOD", or "CHEF"
    private String description; // Maps from Cuisine, FoodType, or Bio
    private Double rating;      // All three entities have a rating field in SQL
    private String imageId;
}