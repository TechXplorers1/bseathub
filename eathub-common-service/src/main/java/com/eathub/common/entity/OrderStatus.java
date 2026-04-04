package com.eathub.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "order_status")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatus {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    @Column(name = "is_terminal")
    private Boolean isTerminal;

    private Integer sequence;
}
