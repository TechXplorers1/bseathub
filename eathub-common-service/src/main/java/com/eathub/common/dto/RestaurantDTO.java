package com.eathub.common.dto;

import lombok.Data;
import java.util.List;

@Data
public class RestaurantDTO {
    private String id;
    private String name;
    private String slug;
    private String type;
    private String cuisine;
    private String imageId;
    private Double rating;
    private Integer reviews; // Maps from reviewsCount
    private Integer deliveryTime; // Maps from avgDeliveryTime
    private Double deliveryFee; // Maps from baseDeliveryFee
    private Boolean isOpen;
    private List<String> services;
}