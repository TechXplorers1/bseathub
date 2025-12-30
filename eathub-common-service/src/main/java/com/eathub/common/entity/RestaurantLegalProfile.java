package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "restaurant_legal_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantLegalProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "legal_business_name")
    private String legalBusinessName;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "fssai_license_number")
    private String fssaiLicenseNumber;

    @Column(name = "fssai_expiry_date")
    private LocalDate fssaiExpiryDate;

    @Column(name = "business_type")
    private String businessType;

    @Column(name = "registered_address")
    private String registeredAddress;

    // Banking
    @Column(name = "bank_account_holder_name")
    private String bankAccountHolderName;

    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Column(name = "bank_ifsc")
    private String bankIFSC; // This was the cause of the specific error

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "payment_gateway")
    private String paymentGateway;

    @Column(name = "gateway_merchant_id")
    private String gatewayMerchantId;

    @Column(name = "payout_schedule")
    private String payoutSchedule;

    @Column(name = "kyc_status")
    private String kycStatus;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
}