package com.eathub.common.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuCategoryDTO {
    private String id;
    private String title;
    private List<MenuItemDTO> items;
}