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
    private String basePrice;
    private String status;
}
