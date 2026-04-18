package com.eathub.common.service;

import com.eathub.common.dto.ChefBookingDTO;
import com.eathub.common.entity.Chef;
import com.eathub.common.entity.ChefBooking;
import com.eathub.common.entity.ChefService;
import com.eathub.common.entity.Notification;
import com.eathub.common.entity.User;
import com.eathub.common.repository.ChefBookingRepository;
import com.eathub.common.repository.ChefRepository;
import com.eathub.common.repository.ChefServiceRepository;
import com.eathub.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChefBookingService {

    private final ChefBookingRepository chefBookingRepository;
    private final ChefRepository chefRepository;
    private final UserRepository userRepository;
    private final ChefServiceRepository chefServiceRepository;
    private final FirebaseService firebaseService;
    private final NotificationHistoryService notificationHistoryService;

    @Transactional
    public ChefBookingDTO createBooking(ChefBookingDTO dto) {
        User customer = userRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Chef chef = chefRepository.findById(dto.getChefId())
                .orElseThrow(() -> new RuntimeException("Chef not found"));

        ChefService service = null;
        if (dto.getServiceId() != null) {
            service = chefServiceRepository.findById(dto.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found"));
        }

        ChefBooking booking = ChefBooking.builder()
                .customer(customer)
                .chef(chef)
                .service(service)
                .eventDate(dto.getEventDate())
                .guests(dto.getGuests())
                .totalAmount(dto.getTotalAmount())
                .status("Pending")
                .paymentStatus("Unpaid")
                .eventAddress(dto.getEventAddress())
                .notes(dto.getNotes())
                .eventType(dto.getEventType())
                .customerPhone(dto.getCustomerPhone())
                .foodPreference(dto.getFoodPreference())
                .isNegotiable(dto.getIsNegotiable() != null ? dto.getIsNegotiable() : false)
                .eventTime(dto.getEventTime())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ChefBooking savedBooking = chefBookingRepository.save(booking);

        // ── Notify Chef of New Booking ───────────────────────────────
        try {
            User chefOwner = chef.getOwner();
            if (chefOwner != null && chefOwner.getFcmToken() != null) {
                String title = "New Event Booking Request! 👨‍🍳";
                String body = customer.getName() + " wants to book you for an event on " + dto.getEventDate();
                
                java.util.Map<String, String> data = new java.util.HashMap<>();
                data.put("bookingId", savedBooking.getId());
                data.put("action", "NEW_BOOKING");
                
                Notification n = notificationHistoryService.saveNotification(chefOwner.getId(), title, body, "BOOKING", savedBooking.getId());
                if (n != null) {
                    data.put("id", n.getId());
                    data.put("type", "BOOKING");
                    data.put("referenceId", savedBooking.getId());
                }
                firebaseService.sendNotification(chefOwner.getFcmToken(), title, body, data);
            }
        } catch (Exception e) {
            System.err.println("Failed to notify chef of new booking: " + e.getMessage());
        }

        return toDTO(savedBooking);
    }

    public List<ChefBookingDTO> getChefBookings(String chefId) {
        return chefBookingRepository.findByChef_IdOrderByEventDateDesc(chefId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ChefBookingDTO> getChefBookingsByOwner(String ownerId) {
        Chef chef = chefRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("Chef not found for this owner"));
        return getChefBookings(chef.getId());
    }

    public List<ChefBookingDTO> getCustomerBookings(String customerId) {
        return chefBookingRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChefBookingDTO updateStatus(String bookingId, String status, String reason) {
        ChefBooking booking = chefBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        if (reason != null) {
            booking.setStatusReason(reason);
        }
        booking.setUpdatedAt(LocalDateTime.now());
        ChefBooking savedBooking = chefBookingRepository.save(booking);

        // ── Notify Customer of Status Update ──────────────────────────
        try {
            User customer = savedBooking.getCustomer();
            if (customer != null && customer.getFcmToken() != null) {
                String title = "Chef Booking Update 🔔";
                String body = "Your booking with " + savedBooking.getChef().getName() + " is now " + status;
                
                if ("Confirmed".equalsIgnoreCase(status)) {
                    title = "Booking Confirmed! ✅";
                    body = "Chef " + savedBooking.getChef().getName() + " has accepted your event booking.";
                } else if ("Completed".equalsIgnoreCase(status)) {
                    title = "Event Completed! ⭐";
                    body = "We hope you enjoyed the culinary experience. Please leave a review!";
                } else if ("Cancelled".equalsIgnoreCase(status)) {
                    title = "Booking Cancelled 🚫";
                    body = "Your booking was cancelled. Reason: " + (reason != null ? reason : "Not specified");
                }

                java.util.Map<String, String> data = new java.util.HashMap<>();
                data.put("bookingId", savedBooking.getId());
                data.put("status", status);
                data.put("action", "BOOKING_UPDATE");
                
                Notification n = notificationHistoryService.saveNotification(customer.getId(), title, body, "BOOKING", savedBooking.getId());
                if (n != null) {
                    data.put("id", n.getId());
                    data.put("type", "BOOKING");
                    data.put("referenceId", savedBooking.getId());
                }
                firebaseService.sendNotification(customer.getFcmToken(), title, body, data);
            }
        } catch (Exception e) {
            System.err.println("Failed to notify customer of booking update: " + e.getMessage());
        }

        return toDTO(savedBooking);
    }

    @Transactional
    public ChefBookingDTO updatePaymentStatus(String bookingId, String paymentStatus) {
        ChefBooking booking = chefBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setPaymentStatus(paymentStatus);
        booking.setUpdatedAt(LocalDateTime.now());
        return toDTO(chefBookingRepository.save(booking));
    }

    public Double getChefEarnings(String chefId) {
        return chefBookingRepository.findByChef_Id(chefId)
                .stream()
                .filter(b -> b.getStatus().equals("Completed") && b.getPaymentStatus().equals("Paid"))
                .mapToDouble(ChefBooking::getTotalAmount)
                .sum();
    }

    public Double getChefEarningsByOwner(String ownerId) {
        Chef chef = chefRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("Chef not found for this owner"));
        return getChefEarnings(chef.getId());
    }

    private ChefBookingDTO toDTO(ChefBooking b) {
        return ChefBookingDTO.builder()
                .id(b.getId())
                .customerId(b.getCustomer().getId())
                .customerName(b.getCustomer().getName())
                .chefId(b.getChef().getId())
                .chefName(b.getChef().getName())
                .serviceId(b.getService() != null ? b.getService().getId() : null)
                .serviceName(b.getService() != null ? b.getService().getName() : "General Hire")
                .eventDate(b.getEventDate())
                .guests(b.getGuests())
                .totalAmount(b.getTotalAmount())
                .status(b.getStatus())
                .paymentStatus(b.getPaymentStatus())
                .createdAt(b.getCreatedAt())
                .eventAddress(b.getEventAddress())
                .notes(b.getNotes())
                .statusReason(b.getStatusReason())
                .eventType(b.getEventType())
                .customerPhone(b.getCustomerPhone())
                .foodPreference(b.getFoodPreference())
                .isNegotiable(b.getIsNegotiable())
                .eventTime(b.getEventTime())
                .build();
    }
}
