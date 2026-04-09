package com.eathub.common.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemDTO {

    private String id;
    private String name;
    private String description;
    private Double price;
    private String imageId;
    private Boolean isSpecial;
    private String status;
    private String category;
    private String providerId;
    private String providerName;
    private String providerType;
    private String providerSlug;
}
