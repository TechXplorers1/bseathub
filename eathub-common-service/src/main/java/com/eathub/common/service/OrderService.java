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
            "Pending Approval", "Provider Confirmed", "Confirmed", "Preparing", "Preparation Completed",
            "Out for Delivery", "Delivered", "Cancelled");

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final HomeFoodProviderRepository homeFoodRepository;
    private final FirebaseService firebaseService;
    private final UserService userService;
    private final OrderStatusHistoryRepository historyRepository;
    private final NotificationHistoryService notificationHistoryService;

    // ─── Create ─────────────────────────────────────────────────────────────

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }

        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Customer not found: " + request.getCustomerId()));

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
                .paymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : "Paid")
                .orderNotes(request.getOrderNotes())
                .currentStatusId("Confirmed")
                .expectedDeliveryAt(LocalDateTime.now().plusMinutes(45)) // default ETA
                .build();

        // ── Resolve Provider ────────────────────────────────────────────────
        if ("Restaurant".equalsIgnoreCase(request.getSourceType())) {
            Restaurant restaurant = restaurantRepository.findById(request.getSourceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Restaurant not found: " + request.getSourceId()));
            order.setRestaurant(restaurant);
        } else if ("HomeFood".equalsIgnoreCase(request.getSourceType())) {
            HomeFoodProvider provider = homeFoodRepository.findById(request.getSourceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "HomeFood provider not found: " + request.getSourceId()));
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

        // ── Record History ──────────────────────────────────────────────────
        recordStatusHistory(savedOrder, "SYSTEM", "Order created");

        // RE-FETCH to ensure eager items are present in the response
        savedOrder = orderRepository.findById(savedOrder.getId()).orElse(savedOrder);

        // ── Send Notification to Provider ──────────────────────────────────
        try {
            User owner = null;
            String brandName = "New Order";
            if ("Restaurant".equalsIgnoreCase(savedOrder.getSourceType()) && savedOrder.getRestaurant() != null) {
                owner = savedOrder.getRestaurant().getOwner();
                brandName = savedOrder.getRestaurant().getName();
            } else if ("HomeFood".equalsIgnoreCase(savedOrder.getSourceType())
                    && savedOrder.getHomeFoodProvider() != null) {
                owner = savedOrder.getHomeFoodProvider().getOwner();
                brandName = savedOrder.getHomeFoodProvider().getBrandName();
            }

            if (owner != null && owner.getFcmToken() != null) {
                String title = "New Order from " + savedOrder.getCustomer().getName();
                String body = "You have a new " + savedOrder.getSourceType() + " order from " + brandName + " for $"
                        + savedOrder.getTotalAmount();

                java.util.Map<String, String> data = new java.util.HashMap<>();
                data.put("orderId", savedOrder.getId());
                data.put("action", "NEW_ORDER");
                data.put("address", savedOrder.getDeliveryAddress());

                Notification n = notificationHistoryService.saveNotification(owner.getId(), title, body, "ORDER", savedOrder.getId());
                if (n != null) {
                    data.put("id", n.getId());
                    data.put("type", "ORDER");
                    data.put("referenceId", savedOrder.getId());
                }
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
        System.out
                .println("DEBUG: Fetching orders for partner user: " + user.getEmail() + " (ID: " + user.getId() + ")");

        Optional<Restaurant> restaurant = restaurantRepository.findByOwnerId(user.getId());
        if (restaurant.isPresent()) {
            System.out.println("DEBUG: User is a Restaurant owner: " + restaurant.get().getName());
            return getOrdersByRestaurant(restaurant.get().getId());
        }

        Optional<HomeFoodProvider> homefood = homeFoodRepository.findByOwnerId(user.getId());
        if (homefood.isPresent()) {
            System.out.println("DEBUG: User is a HomeFood provider: " + homefood.get().getBrandName());
            return getOrdersByHomeFoodProvider(homefood.get().getId());
        }

        System.out.println("DEBUG: No partner profile (Restaurant/HomeFood) found for user ID: " + user.getId()
                + " - returning empty orders list.");
        return new ArrayList<>();
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

        // ── Record History ──────────────────────────────────────────────────
        recordStatusHistory(updatedOrder, "PROVIDER", "Manual status update to " + status);

        // ── Send Notification to Customer on Status Change ──────────────────
        if (updatedOrder.getCustomer().getFcmToken() != null) {
            try {
                String title = "";
                String body = "";
                java.util.Map<String, String> data = new java.util.HashMap<>();
                data.put("orderId", updatedOrder.getId());
                data.put("status", status);

                switch (status) {
                    case "Provider Confirmed":
                        title = "Order Confirmed by Provider! ✨";
                        body = "Chef confirmed your order from " + toResponse(updatedOrder).getSourceName() + ". Please complete payment to start cooking!";
                        data.put("action", "ORDER_CONFIRMED");
                        break;
                    case "Preparing":
                        title = "Your food is being prepared! 🍳";
                        body = "The kitchen has started cooking your delicious meal.";
                        data.put("action", "ORDER_STATUS_UPDATE");
                        break;
                    case "Preparation Completed":
                        title = "Meal is Ready! 🍱";
                        body = "Your order has been packed and is ready for pickup/delivery.";
                        data.put("action", "ORDER_STATUS_UPDATE");
                        break;
                    case "Out for Delivery":
                        title = "Your order is on the way! 🛵";
                        body = "The delivery partner is bringing your meal to you.";
                        data.put("action", "ORDER_STATUS_UPDATE");
                        break;
                    case "Delivered":
                        title = "Enjoy your meal! 🍴";
                        body = "Your order was successfully delivered. Don't forget to rate your experience!";
                        data.put("action", "ORDER_DELIVERED");
                        break;
                }

                if (!title.isEmpty()) {
                    Notification n = notificationHistoryService.saveNotification(updatedOrder.getCustomer().getId(), title, body, "ORDER", updatedOrder.getId());
                    if (n != null) {
                        data.put("id", n.getId());
                        data.put("type", "ORDER");
                        data.put("referenceId", updatedOrder.getId());
                    }
                    firebaseService.sendNotification(updatedOrder.getCustomer().getFcmToken(), title, body, data);
                }
            } catch (Exception e) {
                System.err.println("Failed to send status update notification: " + e.getMessage());
            }
        }

        return toResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse cancelOrder(String orderId, String reason, String cancelledBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));

        if ("Delivered".equals(order.getCurrentStatusId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot cancel a delivered order");
        }
        if ("Cancelled".equals(order.getCurrentStatusId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Order is already cancelled");
        }

        order.setCurrentStatusId("Cancelled");
        order.setCancellationReason(reason);
        order.setCancelledBy(cancelledBy != null ? cancelledBy : "Customer");

        Order savedOrder = orderRepository.save(order);
        recordStatusHistory(savedOrder, cancelledBy != null ? cancelledBy : "SYSTEM", "Order cancelled: " + reason);

        // ── Notify other party of cancellation ──────────────────────
        try {
            User notifyUser = null;
            String title = "Order Cancelled 🚫";
            String body = "An order has been cancelled: " + reason;

            if ("Customer".equalsIgnoreCase(cancelledBy)) {
                // Notify provider
                if (savedOrder.getRestaurant() != null) {
                    notifyUser = savedOrder.getRestaurant().getOwner();
                } else if (savedOrder.getHomeFoodProvider() != null) {
                    notifyUser = savedOrder.getHomeFoodProvider().getOwner();
                }
                body = "Customer cancelled their order: " + reason;
            } else {
                // Provider cancelled, notify customer
                notifyUser = savedOrder.getCustomer();
                body = "The provider has cancelled your order: " + reason;
            }

            if (notifyUser != null && notifyUser.getFcmToken() != null) {
                java.util.Map<String, String> data = new java.util.HashMap<>();
                data.put("orderId", savedOrder.getId());
                data.put("status", "Cancelled");

                Notification n = notificationHistoryService.saveNotification(notifyUser.getId(), title, body, "ORDER", savedOrder.getId());
                if (n != null) {
                    data.put("id", n.getId());
                    data.put("type", "ORDER");
                    data.put("referenceId", savedOrder.getId());
                }
                firebaseService.sendNotification(notifyUser.getFcmToken(), title, body, data);
            }
        } catch (Exception e) {
            System.err.println("Failed to notify of cancellation: " + e.getMessage());
        }

        return toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse updatePaymentStatus(String orderId, String paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));

        order.setPaymentStatus(paymentStatus);

        if ("Paid".equalsIgnoreCase(paymentStatus) || "Completed".equalsIgnoreCase(paymentStatus)) {
            order.setCurrentStatusId("Confirmed");
            // Notify Provider that payment is done!
            try {
                String ownerId = null;
                if (order.getRestaurant() != null && order.getRestaurant().getOwner() != null) {
                    ownerId = order.getRestaurant().getOwner().getId();
                } else if (order.getHomeFoodProvider() != null && order.getHomeFoodProvider().getOwner() != null) {
                    ownerId = order.getHomeFoodProvider().getOwner().getId();
                }

                if (ownerId != null) {
                    userRepository.findById(ownerId).ifPresent(owner -> {
                        if (owner.getFcmToken() != null) {
                            String title = "New Paid Order! 💰";
                            String body = "An order of $" + order.getTotalAmount()
                                    + " was just paid. Please start preparation!";
                            
                            java.util.Map<String, String> data = new java.util.HashMap<>();
                            data.put("orderId", order.getId());
                            data.put("action", "PAYMENT_DONE");

                            Notification n = notificationHistoryService.saveNotification(owner.getId(), title, body, "ORDER", order.getId());
                            if (n != null) {
                                data.put("id", n.getId());
                                data.put("type", "ORDER");
                                data.put("referenceId", order.getId());
                            }
                            firebaseService.sendNotification(owner.getFcmToken(), title, body, data);
                        }
                    });
                }
            } catch (Exception e) {
                System.err.println("Failed to notify provider of payment: " + e.getMessage());
            }
        }

        Order savedOrder = orderRepository.save(order);
        recordStatusHistory(savedOrder, "SYSTEM", "Payment status updated to " + paymentStatus);
        return toResponse(savedOrder);
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
                .cancellationReason(order.getCancellationReason())
                .cancelledBy(order.getCancelledBy())
                .items(itemResponses)
                .build();
    }

    private void recordStatusHistory(Order order, String changedBy, String reason) {
        try {
            OrderStatusHistory history = OrderStatusHistory.builder()
                    .orderId(order.getId())
                    .statusId(order.getCurrentStatusId())
                    .changedAt(LocalDateTime.now())
                    .changedBy(changedBy)
                    .reason(reason)
                    .build();
            historyRepository.save(history);
        } catch (Exception e) {
            System.err.println("Failed to record status history: " + e.getMessage());
        }
    }
}
