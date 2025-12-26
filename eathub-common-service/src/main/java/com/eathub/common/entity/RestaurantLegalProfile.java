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

    private String legalBusinessName;
    private String gstNumber;
    private String panNumber;
    private String fssaiLicenseNumber;
    private LocalDate fssaiExpiryDate;
    private String businessType;
    private String registeredAddress;

    // Banking
    private String bankAccountHolderName;
    private String bankAccountNumber;
    private String bankIFSC;
    private String bankName;

    private String paymentGateway;
    private String gatewayMerchantId;
    private String payoutSchedule;
    private String kycStatus;
    private LocalDateTime verifiedAt;
}
