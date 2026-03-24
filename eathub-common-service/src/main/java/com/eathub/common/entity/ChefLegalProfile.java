package com.eathub.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chef_legal_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChefLegalProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne
    @JoinColumn(name = "chef_id")
    private Chef chef;

    private String legalBusinessName;
    private String gstNumber;
    private String panNumber;
    private String bankAccountHolderName;
    private String bankAccountNumber;
    private String bankIFSC;
    private String bankName;

    @Column(columnDefinition = "TEXT")
    private String foodSafetyCertUrl;

    @Column(columnDefinition = "TEXT")
    private String culinaryDiplomaUrl;
}
