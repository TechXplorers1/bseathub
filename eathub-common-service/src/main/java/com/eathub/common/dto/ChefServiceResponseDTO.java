package com.eathub.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChefServiceResponseDTO {
    private String id;
    private String name;
    private String description;
    private Double basePrice;
    private String category;
    private String itemType;
    private Boolean isSignature;
    private Boolean isNegotiable;
    private String imageId;
    private String status;
}
