package com.eathub.common.dto;

import lombok.Data;

@Data
public class RestaurantCreateRequestDTO {

    private String name;
    private String description;
    private String cuisineType;
    private String slug;
    private String ownerId;
}
