package com.eathub.common.dto;

import lombok.Data;

@Data
public class MenuItemRequestDTO {
    private String name;
    private String description;
    private Double price;
    private String categoryId;
    private String status;    // Added to match frontend
    private Boolean isSpecial;
}