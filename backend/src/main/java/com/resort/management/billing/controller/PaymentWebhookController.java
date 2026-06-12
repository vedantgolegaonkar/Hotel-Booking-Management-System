package com.resort.management.billing.controller;

import com.resort.management.booking.service.BookingService;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*")
public class PaymentWebhookController {
    private static final Logger logger = LoggerFactory.getLogger(PaymentWebhookController.class);

    @Autowired
    private BookingService bookingService;

    // Razorpay Webhook Callback
    @PostMapping("/webhook")
    public ResponseEntity<?> handleRazorpayWebhook(@RequestBody Map<String, Object> payload) {
        logger.info("Received Razorpay Webhook callback: {}", payload);
        String event = (String) payload.get("event");

        if ("order.paid".equals(event) || "payment.captured".equals(event)) {
            Map<String, Object> innerPayload = (Map<String, Object>) payload.get("payload");
            Map<String, Object> paymentEntity = (Map<String, Object>) ((Map<String, Object>) innerPayload.get("payment")).get("entity");

            String orderId = (String) paymentEntity.get("order_id");
            String paymentId = (String) paymentEntity.get("id");
            String signature = "mock_sig_" + paymentId;

            bookingService.confirmBookingPayment(orderId, paymentId, signature);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Payment processed"));
        }

        return ResponseEntity.ok(Map.of("status", "ignored", "message", "Event not handled"));
    }

    // Direct Confirmation Endpoint for Frontend Integration/Testing
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPaymentDirectly(@RequestBody ConfirmPaymentRequest request) {
        bookingService.confirmBookingPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getSignature() != null ? request.getSignature() : "sig_" + request.getRazorpayPaymentId()
        );
        return ResponseEntity.ok(Map.of("status", "success", "message", "Booking payment verified."));
    }

    @Data
    public static class ConfirmPaymentRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String signature;
    }
}
