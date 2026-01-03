package com.eathub.common.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuResponseDTO {
    private String providerId;
    private String providerName;
    private String providerType; // "restaurant", "home-food", or "chef"
    private List<MenuCategoryDTO> categories;
}