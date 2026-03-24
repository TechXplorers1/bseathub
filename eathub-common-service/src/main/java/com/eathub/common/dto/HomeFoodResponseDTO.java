package com.eathub.common.dto;

import lombok.Data;

@Data
public class HomeFoodResponseDTO {
    private String id;
    private String name;
    private String description;
    private String foodType;
    private String slug;
    private Double rating;
    private Integer reviews;
    private Boolean isActive;
    private String operationalStatus;
    private String workingHours;
    private String imageId;
    private String coverImageId;

    // Address
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    // Legal
    private String legalBusinessName;
    private String gstNumber;
    private String panNumber;
    private String fssaiLicenseNumber;
    private String businessType;
    private String bankAccountHolderName;
    private String bankAccountNumber;
    private String bankIFSC;
    private String bankName;
}