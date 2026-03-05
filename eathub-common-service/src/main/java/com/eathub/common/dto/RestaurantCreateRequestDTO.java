package com.eathub.common.dto;

import lombok.Data;

@Data
public class RestaurantCreateRequestDTO {

    private String name;
    private String description;
    private String cuisineType;
    private String restaurantType;
    private String slug;
    private String ownerId;
    private String role;

    // Address
    private String addressLine1;
    private String city;
    private String state;
    private String pincode;

    // Legal
    private String gstNumber;
    private String bankAccountNumber;
}