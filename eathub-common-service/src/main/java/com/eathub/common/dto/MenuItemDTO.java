package com.eathub.common.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDTO {
    private String id;
    private String name;
    private String description;
    private Double price;
    private String imageId;
    private Boolean isSpecial;
    private String status;
}