package com.eathub.common.controller;

import com.eathub.common.dto.OrderDTO.*;
import com.eathub.common.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for order management.
 *
 * Base URL (via context-path): /api/v1/orders
 *
 * POST / – place a new order
 * GET /customer/{customerId} – customer order history
 * GET /{orderId} – order detail
 * PATCH /{orderId}/status – update status (provider / admin)
 * POST /{orderId}/cancel – cancel an order
 * GET /restaurant/{restaurantId} – orders for a restaurant dashboard
 * GET /home-food/{providerId} – orders for a home food provider dashboard
 */
@RestController
@RequestMapping("/v1/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:9004", "http://localhost:3000" })
public class OrderController {

    private final OrderService orderService;

    // ─── Place Order ────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── Customer Endpoints ─────────────────────────────────────────────────
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable String orderId,
            @RequestParam(required = false, defaultValue = "User cancelled") String reason,
            @RequestParam(required = false) String cancelledBy) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, reason, cancelledBy));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<OrderResponse>> getOrdersByPartner(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(orderService.getOrdersByPartner(token));
    }

    // ─── Provider Endpoints ─────────────────────────────────────────────────
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByRestaurant(@PathVariable String restaurantId) {
        return ResponseEntity.ok(orderService.getOrdersByRestaurant(restaurantId));
    }

    @GetMapping("/home-food/{providerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByHomeFoodProvider(@PathVariable String providerId) {
        return ResponseEntity.ok(orderService.getOrdersByHomeFoodProvider(providerId));
    }

    // ─── Status Update (Provider / Admin) ───────────────────────────────────
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    @PatchMapping("/{orderId}/payment")
    public ResponseEntity<OrderResponse> updatePaymentStatus(
            @PathVariable String orderId,
            @RequestParam String paymentStatus) {
        return ResponseEntity.ok(orderService.updatePaymentStatus(orderId, paymentStatus));
    }
}
