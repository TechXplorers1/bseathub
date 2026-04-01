package com.eathub.common.service;

import com.eathub.common.dto.OrderDTO.*;
import com.eathub.common.entity.*;
import com.eathub.common.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final List<String> VALID_STATUSES = List.of(
            "Pending Approval", "Approved", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"
    );

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final HomeFoodProviderRepository homeFoodRepository;
    private final FirebaseService firebaseService;
    private final UserService userService;

    // ─── Create ─────────────────────────────────────────────────────────────

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }

        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found: " + request.getCustomerId()));

        Order order = Order.builder()
                .customer(customer)
                .sourceType(request.getSourceType())
                .deliveryAddress(request.getDeliveryAddress())
                .subtotalAmount(request.getSubtotalAmount())
                .taxAmount(request.getTaxAmount())
                .deliveryFee(request.getDeliveryFee())
                .platformFee(request.getPlatformFee())
                .discountAmount(request.getDiscountAmount())
                .totalAmount(request.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : "Awaiting Payment")
                .orderNotes(request.getOrderNotes())
                .currentStatusId("Pending Approval")
                .expectedDeliveryAt(LocalDateTime.now().plusMinutes(45)) // default ETA
                .build();

        // ── Resolve Provider ────────────────────────────────────────────────
        if ("Restaurant".equalsIgnoreCase(request.getSourceType())) {
            Restaurant restaurant = restaurantRepository.findById(request.getSourceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + request.getSourceId()));
            order.setRestaurant(restaurant);
        } else if ("HomeFood".equalsIgnoreCase(request.getSourceType())) {
            HomeFoodProvider provider = homeFoodRepository.findById(request.getSourceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "HomeFood provider not found: " + request.getSourceId()));
            order.setHomeFoodProvider(provider);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid sourceType '" + request.getSourceType() + "'. Must be 'Restaurant' or 'HomeFood'");
        }

        // ── Build Order Items ───────────────────────────────────────────────
        List<OrderItem> items = request.getItems().stream().map(itemReq -> OrderItem.builder()
                .order(order)
                .itemName(itemReq.getItemName())
                .itemType(itemReq.getItemType())
                .itemRefId(itemReq.getItemRefId())
                .quantity(itemReq.getQuantity())
                .unitPrice(itemReq.getUnitPrice())
                .totalPrice(itemReq.getTotalPrice())
                .build()).collect(Collectors.toList());

        order.setItems(items);

        Order savedOrder = orderRepository.save(order);
        
        // ── Send Notification to Provider ──────────────────────────────────
        try {
            User owner = null;
            String brandName = "New Order";
            if ("Restaurant".equalsIgnoreCase(savedOrder.getSourceType()) && savedOrder.getRestaurant() != null) {
                owner = savedOrder.getRestaurant().getOwner();
                brandName = savedOrder.getRestaurant().getName();
            } else if ("HomeFood".equalsIgnoreCase(savedOrder.getSourceType()) && savedOrder.getHomeFoodProvider() != null) {
                owner = savedOrder.getHomeFoodProvider().getOwner();
                brandName = savedOrder.getHomeFoodProvider().getBrandName();
            }

            if (owner != null && owner.getFcmToken() != null) {
                String title = "New Order from " + savedOrder.getCustomer().getName();
                String body = "You have a new " + savedOrder.getSourceType() + " order from " + brandName + " for ₹" + savedOrder.getTotalAmount();
                
                java.util.Map<String, String> data = new java.util.HashMap<>();
                data.put("orderId", savedOrder.getId());
                data.put("action", "NEW_ORDER");
                data.put("address", savedOrder.getDeliveryAddress());

                firebaseService.sendNotification(owner.getFcmToken(), title, body, data);
            }
        } catch (Exception e) {
            System.err.println("Failed to send order notification: " + e.getMessage());
        }

        return toResponse(savedOrder);
    }

    // ─── Customer Queries ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCustomer(String customerId) {
        if (!userRepository.existsById(customerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found: " + customerId);
        }
        return orderRepository.findByCustomer_IdOrderByOrderPlacedAtDesc(customerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));
        return toResponse(order);
    }

    // ─── Provider Queries ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByRestaurant(String restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found: " + restaurantId);
        }
        return orderRepository.findByRestaurant_IdOrderByOrderPlacedAtDesc(restaurantId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByHomeFoodProvider(String providerId) {
        if (!homeFoodRepository.existsById(providerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "HomeFood provider not found: " + providerId);
        }
        return orderRepository.findByHomeFoodProvider_IdOrderByOrderPlacedAtDesc(providerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByPartner(String token) {
        User user = userService.getUserByToken(token);
        
        // Similarly check for restaurant...
        Optional<Restaurant> restaurant = restaurantRepository.findByOwnerId(user.getId());
        if (restaurant.isPresent()) {
            return getOrdersByRestaurant(restaurant.get().getId());
        }
        
        Optional<HomeFoodProvider> homefood = homeFoodRepository.findByOwnerId(user.getId());
        if (homefood.isPresent()) {
            return getOrdersByHomeFoodProvider(homefood.get().getId());
        }
        
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No partner profile found for this user");
    }

    // ─── Status Update ────────────────────────────────────────────────────────

    @Transactional
    public OrderResponse updateOrderStatus(String orderId, String status) {
        if (!VALID_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status '" + status + "'. Allowed: " + VALID_STATUSES);
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));

        if ("Delivered".equals(order.getCurrentStatusId()) || "Cancelled".equals(order.getCurrentStatusId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot update a terminal order (status: " + order.getCurrentStatusId() + ")");
        }

        order.setCurrentStatusId(status);
        Order updatedOrder = orderRepository.save(order);

        // ── Send Notification to Customer on Approval ──────────────────────
        if ("Approved".equals(status) && updatedOrder.getCustomer().getFcmToken() != null) {
            try {
                String title = "Order Approved! 🚀";
                String body = "Good news! Your order from " + toResponse(updatedOrder).getSourceName() + " is approved. Please complete payment to confirm.";
                
                java.util.Map<String, String> data = new java.util.HashMap<>();
                data.put("orderId", updatedOrder.getId());
                data.put("action", "ORDER_APPROVED");
                data.put("total", updatedOrder.getTotalAmount().toString());

                firebaseService.sendNotification(updatedOrder.getCustomer().getFcmToken(), title, body, data);
            } catch (Exception e) {
                System.err.println("Failed to send approval notification: " + e.getMessage());
            }
        }

        return toResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse cancelOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));

        if ("Delivered".equals(order.getCurrentStatusId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot cancel a delivered order");
        }
        if ("Cancelled".equals(order.getCurrentStatusId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Order is already cancelled");
        }
        if ("Out for Delivery".equals(order.getCurrentStatusId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot cancel an order that is already out for delivery");
        }

        order.setCurrentStatusId("Cancelled");
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updatePaymentStatus(String orderId, String paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));
        
        order.setPaymentStatus(paymentStatus);
        
        if ("Paid".equalsIgnoreCase(paymentStatus) || "Completed".equalsIgnoreCase(paymentStatus)) {
            order.setCurrentStatusId("Confirmed");
            // Optional: Notify provider that payment is done and they can start preparing
        }
        
        return toResponse(orderRepository.save(order));
    }

    // ─── Mapper ───────────────────────────────────────────────────────────────

    private OrderResponse toResponse(Order order) {
        String sourceName = "Unknown";
        String sourceId = null;

        if ("Restaurant".equalsIgnoreCase(order.getSourceType()) && order.getRestaurant() != null) {
            sourceName = order.getRestaurant().getName();
            sourceId = order.getRestaurant().getId();
        } else if ("HomeFood".equalsIgnoreCase(order.getSourceType()) && order.getHomeFoodProvider() != null) {
            sourceName = order.getHomeFoodProvider().getBrandName();
            sourceId = order.getHomeFoodProvider().getId();
        }

        List<OrderItemResponse> itemResponses = new ArrayList<>();
        if (order.getItems() != null) {
            itemResponses = order.getItems().stream().map(item -> OrderItemResponse.builder()
                    .id(item.getId())
                    .itemName(item.getItemName())
                    .itemType(item.getItemType())
                    .itemRefId(item.getItemRefId())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .totalPrice(item.getTotalPrice())
                    .build()).collect(Collectors.toList());
        }

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getName())
                .sourceType(order.getSourceType())
                .sourceId(sourceId)
                .sourceName(sourceName)
                .currentStatusId(order.getCurrentStatusId())
                .orderPlacedAt(order.getOrderPlacedAt())
                .expectedDeliveryAt(order.getExpectedDeliveryAt())
                .deliveryAddress(order.getDeliveryAddress())
                .subtotalAmount(order.getSubtotalAmount())
                .taxAmount(order.getTaxAmount())
                .deliveryFee(order.getDeliveryFee())
                .platformFee(order.getPlatformFee())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderNotes(order.getOrderNotes())
                .items(itemResponses)
                .build();
    }
}
