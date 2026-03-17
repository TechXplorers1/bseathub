package com.eathub.common.dto;

import lombok.Data;

/**
 * DTO for the restaurant owner to update their full profile from the dashboard settings page.
 * Fields are split across three DB tables:
 *   - restaurants          : name, description, cuisineType, imageId, coverImageId
 *   - restaurant_addresses : addressLine1..postalCode
 *   - restaurant_legal_profiles : bank + compliance fields
 */
@Data
public class RestaurantProfileUpdateDTO {

    // ── Core restaurant fields ─────────────────────────────────────────────
    private String name;
    private String description;
    private String cuisineType;
    private Boolean isOpen;

    /** Base64 data-URL or an external image URL for the profile logo. */
    private String imageId;

    /** Base64 data-URL or an external image URL for the cover / banner photo. */
    private String coverImageId;

    // ── Address fields ─────────────────────────────────────────────────────
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    // ── Legal / banking fields ─────────────────────────────────────────────
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
