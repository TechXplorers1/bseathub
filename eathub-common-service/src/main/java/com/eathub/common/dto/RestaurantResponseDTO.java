package com.eathub.common.dto;

import lombok.Data;

@Data
public class RestaurantResponseDTO {

    private String id;
    private String name;
    private String description;
    private String cuisineType;
    private String slug;

    private Double rating;
    private Integer reviewsCount;
    private Boolean isOpen;
}
