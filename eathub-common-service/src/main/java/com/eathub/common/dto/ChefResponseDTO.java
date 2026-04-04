package com.eathub.common.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChefResponseDTO {
    private String id;
    private String name;
    private String bio;
    private String experience;
    private String avatarUrl;
    private String coverImageId;
    private Double rating;
    private Integer reviews;
    private String slug;
    private String specialty;
    private String preference;
    private Boolean isActive;
    private String workingHours;

    // Expand address fields
    private String addressLine1;
    private String addressLine2;
    private String houseNumber;
    private String streetName;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    // Expand legal fields
    private String legalBusinessName;
    private String gstNumber;
    private String panNumber;
    private String bankAccountHolderName;
    private String bankAccountNumber;
    private String bankIFSC;
    private String bankName;

    private String foodSafetyCertUrl;
    private String culinaryDiplomaUrl;
    private String idProofUrl;

    // Expansion
    private String fullName;
    private String contactNumber;
    private String countryCode;
    private String cuisines;
    private String deliveryAvailability;
    private String idProofType;
    private String idProofNumber;

    private Double basePrice;
    private String workType;
    private String socialLinks;
}