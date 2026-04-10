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

    private Boolean isOnOffer;
    private String offerType;
    private Double offerValue;
    private String offerDescription;
    private String offerStartDate;
    private String offerEndDate;
    private String offerStartTime;
    private String offerEndTime;
    private String offerMetaData;
}
