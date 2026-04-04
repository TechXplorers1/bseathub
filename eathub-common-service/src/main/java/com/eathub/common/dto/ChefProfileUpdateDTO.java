package com.eathub.common.dto;

import lombok.Data;

@Data
public class ChefProfileUpdateDTO {
    // ── Core fields ─────────────────────────────────────────────
    private String name;
    private String bio;
    private String specialty;
    private String experience;
    private Boolean isActive;
    private String workingHours;
    private String avatarUrl;
    private String coverImageId;

    // ── Address fields ──────────────────────────────────────────
    private String addressLine1;
    private String addressLine2;
    private String houseNumber;
    private String streetName;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    // ── Legal / Banking fields ──────────────────────────────────
    private String legalBusinessName;
    private String gstNumber;
    private String panNumber;

    private String bankAccountHolderName;
    private String bankAccountNumber;
    private String bankIFSC;
    private String bankName;

    private String foodSafetyCertUrl;
    private String culinaryDiplomaUrl;

    // ── Expansion fields ──────────────────────────────────────────
    private String fullName;
    private String contactNumber;
    private String countryCode;
    private String cuisines;
    private String deliveryAvailability;
    private String idProofType;
    private String idProofNumber;
    private String idProofUrl;

    private Double basePrice;
    private String workType;
    private String socialLinks;
}
