package com.resort.management.booking.controller;

import com.resort.management.booking.model.Coupon;
import com.resort.management.booking.repository.CouponRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@CrossOrigin(origins = "*")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> createCoupon(@Valid @RequestBody Coupon coupon) {
        try {
            if (couponRepository.findByCode(coupon.getCode()).isPresent()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Coupon code already exists."));
            }
            Coupon saved = couponRepository.save(coupon);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @Valid @RequestBody Coupon updatedCoupon) {
        return couponRepository.findById(id)
                .map(coupon -> {
                    coupon.setCode(updatedCoupon.getCode());
                    coupon.setDiscountType(updatedCoupon.getDiscountType());
                    coupon.setDiscountValue(updatedCoupon.getDiscountValue());
                    coupon.setMinBookingValue(updatedCoupon.getMinBookingValue());
                    coupon.setMaxDiscountValue(updatedCoupon.getMaxDiscountValue());
                    coupon.setStartDate(updatedCoupon.getStartDate());
                    coupon.setExpiryDate(updatedCoupon.getExpiryDate());
                    coupon.setUsageLimit(updatedCoupon.getUsageLimit());
                    coupon.setIsActive(updatedCoupon.getIsActive());
                    Coupon saved = couponRepository.save(coupon);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        return couponRepository.findById(id)
                .map(coupon -> {
                    couponRepository.delete(coupon);
                    return ResponseEntity.ok(java.util.Map.of("message", "Coupon deleted successfully"));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateCoupon(
            @RequestParam("code") String code,
            @RequestParam("amount") java.math.BigDecimal amount) {
        try {
            java.util.Optional<Coupon> couponOpt = couponRepository.findByCode(code);
            if (couponOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Invalid coupon code."));
            }
            Coupon coupon = couponOpt.get();
            java.time.LocalDate today = java.time.LocalDate.now();
            if (!Boolean.TRUE.equals(coupon.getIsActive())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Coupon is inactive."));
            }
            if (today.isBefore(coupon.getStartDate())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Coupon is not active yet."));
            }
            if (today.isAfter(coupon.getExpiryDate())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Coupon has expired."));
            }
            if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Coupon usage limit reached."));
            }
            if (coupon.getMinBookingValue() != null && amount.compareTo(coupon.getMinBookingValue()) < 0) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Minimum booking value of ₹" + coupon.getMinBookingValue() + " required."));
            }

            java.math.BigDecimal discount = java.math.BigDecimal.ZERO;
            if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
                discount = amount.multiply(coupon.getDiscountValue().divide(new java.math.BigDecimal("100.00")));
                if (coupon.getMaxDiscountValue() != null && discount.compareTo(coupon.getMaxDiscountValue()) > 0) {
                    discount = coupon.getMaxDiscountValue();
                }
            } else if ("FIXED".equalsIgnoreCase(coupon.getDiscountType())) {
                discount = coupon.getDiscountValue();
            }
            if (discount.compareTo(amount) > 0) {
                discount = amount;
            }

            return ResponseEntity.ok(java.util.Map.of(
                "code", coupon.getCode(),
                "discountAmount", discount,
                "discountType", coupon.getDiscountType(),
                "discountValue", coupon.getDiscountValue()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
