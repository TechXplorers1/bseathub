package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "home_food_legal_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeFoodLegalProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne
    @JoinColumn(name = "home_food_id")
    private HomeFoodProvider homeFoodProvider;

    @Column(name = "legal_business_name")
    private String legalBusinessName;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "fssai_license_number")
    private String fssaiLicenseNumber;

    @Column(name = "id_proof_type")
    private String idProofType;

    @Column(name = "id_proof_number")
    private String idProofNumber;

    @Column(name = "hygiene_verified")
    private Boolean hygieneVerified;

    @Column(name = "business_type")
    private String businessType;

    @Column(name = "bank_account_holder_name")
    private String bankAccountHolderName;

    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Column(name = "bank_ifsc")
    private String bankIFSC;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "hygiene_certificate_url", columnDefinition = "TEXT")
    private String hygieneCertificateUrl;

    @Column(name = "menu_url", columnDefinition = "TEXT")
    private String menuUrl;

    @Column(name = "id_proof_url", columnDefinition = "TEXT")
    private String idProofUrl;
}
