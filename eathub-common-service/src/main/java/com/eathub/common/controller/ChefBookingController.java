package com.eathub.common.controller;

import com.eathub.common.dto.ChefBookingDTO;
import com.eathub.common.service.ChefBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/chef-bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChefBookingController {
    private final ChefBookingService chefBookingService;

    @PostMapping
    public ResponseEntity<ChefBookingDTO> createBooking(@RequestBody ChefBookingDTO dto) {
        return ResponseEntity.ok(chefBookingService.createBooking(dto));
    }

    @GetMapping("/chef/{chefId}")
    public ResponseEntity<List<ChefBookingDTO>> getChefBookings(@PathVariable String chefId) {
        return ResponseEntity.ok(chefBookingService.getChefBookings(chefId));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ChefBookingDTO>> getChefBookingsByOwner(@PathVariable String ownerId) {
        return ResponseEntity.ok(chefBookingService.getChefBookingsByOwner(ownerId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ChefBookingDTO>> getCustomerBookings(@PathVariable String customerId) {
        return ResponseEntity.ok(chefBookingService.getCustomerBookings(customerId));
    }

    @PatchMapping("/{bookingId}/status")
    public ResponseEntity<ChefBookingDTO> updateStatus(
            @PathVariable String bookingId, 
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(chefBookingService.updateStatus(bookingId, status, reason));
    }

    @PatchMapping("/{bookingId}/payment")
    public ResponseEntity<ChefBookingDTO> updatePaymentStatus(@PathVariable String bookingId, @RequestParam String paymentStatus) {
        return ResponseEntity.ok(chefBookingService.updatePaymentStatus(bookingId, paymentStatus));
    }

    @GetMapping("/chef/{chefId}/earnings")
    public ResponseEntity<Map<String, Double>> getChefEarnings(@PathVariable String chefId) {
        return ResponseEntity.ok(Map.of("earnings", chefBookingService.getChefEarnings(chefId)));
    }

    @GetMapping("/owner/{ownerId}/earnings")
    public ResponseEntity<Map<String, Double>> getChefEarningsByOwner(@PathVariable String ownerId) {
        return ResponseEntity.ok(Map.of("earnings", chefBookingService.getChefEarningsByOwner(ownerId)));
    }
}
