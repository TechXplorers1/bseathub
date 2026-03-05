package com.eathub.common.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuResponseDTO {

    private String id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private String status;
    private Boolean isSpecial;

    private String providerId;
    private String providerName;
    private String providerType;

    private List<MenuCategoryDTO> categories;
}