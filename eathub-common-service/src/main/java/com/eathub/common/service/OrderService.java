package com.eathub.common.service;

import com.eathub.common.dto.OrderDTO.*;
import com.eathub.common.entity.*;
import com.eathub.common.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final HomeFoodProviderRepository homeFoodRepository;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

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
                .paymentStatus(request.getPaymentStatus())
                .orderNotes(request.getOrderNotes())
                .currentStatusId("Confirmed") // Initial status
                .build();

        if ("Restaurant".equalsIgnoreCase(request.getSourceType())) {
            Restaurant restaurant = restaurantRepository.findById(request.getSourceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
            order.setRestaurant(restaurant);
        } else if ("HomeFood".equalsIgnoreCase(request.getSourceType())) {
            HomeFoodProvider provider = homeFoodRepository.findById(request.getSourceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "HomeFood provider not found"));
            order.setHomeFoodProvider(provider);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid source type");
        }

        Set<OrderItem> items = request.getItems().stream().map(itemReq -> OrderItem.builder()
                .order(order)
                .itemName(itemReq.getItemName())
                .itemType(itemReq.getItemType())
                .itemRefId(itemReq.getItemRefId())
                .quantity(itemReq.getQuantity())
                .unitPrice(itemReq.getUnitPrice())
                .totalPrice(itemReq.getTotalPrice())
                .build()).collect(Collectors.toSet());

        order.setItems(items);

        Order savedOrder = orderRepository.save(order);
        return toResponse(savedOrder);
    }

    public List<OrderResponse> getOrdersByCustomer(String customerId) {
        return orderRepository.findByCustomer_IdOrderByOrderPlacedAtDesc(customerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderResponse getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(String orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        order.setCurrentStatusId(status);
        return toResponse(orderRepository.save(order));
    }

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

        List<OrderItemResponse> itemResponses = null;
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
                .sourceType(order.getSourceType())
                .sourceId(sourceId)
                .sourceName(sourceName)
                .currentStatusId(order.getCurrentStatusId())
                .orderPlacedAt(order.getOrderPlacedAt())
                .expectedDeliveryAt(order.getExpectedDeliveryAt())
                .deliveryAddress(order.getDeliveryAddress())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .items(itemResponses)
                .build();
    }
}
