package com.eathub.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChefServiceRequestDTO {
    private String name;
    private String description;
    private Double basePrice;
    private String category;
    private String itemType;
    private Boolean isSignature = false;
    private Boolean isNegotiable = false;
    private String imageId;
    private String status;
}
