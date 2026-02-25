package com.eathub.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// import lombok.Data;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemRequestDTO {
    private String name;
    private String description;
    private Double price;
    private String categoryId;
    private String categoryName; // Added to allow creating category on the fly
    private String status; // Added to match frontend
    private Boolean isSpecial;
    private String imageUrl;
}