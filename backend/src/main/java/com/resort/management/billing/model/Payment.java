package com.resort.management.billing.model;

import com.resort.management.booking.model.Booking;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 100)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature", length = 255)
    private String razorpaySignature;

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod; // UPI, CARD, NET_BANKING, CASH, REFUND

    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus; // PENDING, SUCCESSFUL, FAILED, REFUNDED

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Builder.Default
    @Column(name = "transaction_time")
    private LocalDateTime transactionTime = LocalDateTime.now();
}
