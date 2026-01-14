package com.eathub.common.dto;

import lombok.Data;
import java.util.List;

@Data
public class HomeFoodRequestDTO {
    private String brandName;
    private String slug;
    private String foodType;
    private String description;
    private String imageId;
    private String ownerId; // The ID of the User who is registering
    private List<String> categories; 
}