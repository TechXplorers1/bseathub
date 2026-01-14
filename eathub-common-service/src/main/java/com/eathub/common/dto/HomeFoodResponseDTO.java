package com.eathub.common.dto;

import lombok.Data;
import java.util.List;

@Data
public class HomeFoodResponseDTO {
    private String id;
    private String name;
    private String slug;
    private String cuisine;
    private String imageId;
    private Double rating;
    private Integer reviews;
    private Integer deliveryTime;
    private Double deliveryFee;
    private String type = "home-food";
    private List<String> services = List.of("delivery");
}