package com.eathub.common.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChefBookingDTO {
    private String id;
    private String customerId;
    private String customerName;
    private String chefId;
    private String chefName;
    private String serviceId;
    private String serviceName;
    private LocalDateTime eventDate;
    private String eventTime;
    private Integer guests;
    private Double totalAmount;
    private String status;
    private String paymentStatus;
    private LocalDateTime createdAt;
    private String eventAddress;
    private String notes;
    private String statusReason;
    private String eventType;
    private String customerPhone;
    private String foodPreference;
    private Boolean isNegotiable;
}
