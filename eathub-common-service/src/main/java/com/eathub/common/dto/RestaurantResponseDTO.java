package com.eathub.common.dto;

import lombok.Data;

@Data
public class RestaurantResponseDTO {

    // ── Core ──────────────────────────────────────────────
    private String id;
    private String name;
    private String description;
    private String cuisineType;
    private String restaurantType;
    private String slug;
    private Double rating;
    private Integer reviewsCount;
    private Boolean isOpen;
    private String workingHours;
    private String businessModel;

    // ── Owner ─────────────────────────────────────────────
    private String ownerName;
    private String mobileNumber;

    // ── Images ────────────────────────────────────────────
    private String imageId;
    private String coverImageId;

    // ── Address ───────────────────────────────────────────
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    // ── Legal / Banking ───────────────────────────────────
    private String legalBusinessName;
    private String gstNumber;
    private String panNumber;
    private String fssaiLicenseNumber;
    private String businessType;
    private String bankAccountHolderName;
    private String bankAccountNumber;
    private String bankIFSC;
    private String bankName;
    private String fssaiExpiryDate;
    private String fssaiDocumentUrl;
}
