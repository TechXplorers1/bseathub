package com.eathub.common.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/payments")
public class PaymentController {

    @Value("${razorpay.key-id:rzp_test_placeholder}")
    private String keyId;

    @Value("${razorpay.key-secret:secret_placeholder}")
    private String keySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) throws RazorpayException {
        // Amount should be in paise (1 INR = 100 paise)
        int amount = (int) Double.parseDouble(data.get("amount").toString());
        String currency = data.get("currency").toString();

        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount);
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());

        Order order = client.orders.create(orderRequest);

        return ResponseEntity.ok(order.toString());
    }
}
