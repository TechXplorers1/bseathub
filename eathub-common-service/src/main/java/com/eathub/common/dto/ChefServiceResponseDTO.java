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
    private String basePrice;
    private String category;
    private String status;
}
