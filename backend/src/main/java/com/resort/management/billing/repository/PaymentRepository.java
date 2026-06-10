package com.resort.management.billing.repository;

import com.resort.management.billing.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);
    List<Payment> findByBookingId(UUID bookingId);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Payment p WHERE p.razorpayOrderId = :orderId OR p.booking.bookingReference = :orderId")
    Optional<Payment> findByRazorpayOrderIdOrBookingReference(@org.springframework.data.repository.query.Param("orderId") String orderId);
}
