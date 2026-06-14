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
import java.util.stream.Collectors;
import com.resort.management.booking.dto.CouponResponse;
import com.resort.management.core.dto.PaginatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/v1/coupons")
@CrossOrigin(origins = "*")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<PaginatedResponse<CouponResponse>> getAllCoupons(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
            
        Pageable pageable = PageRequest.of(page, size);
        Page<Coupon> couponPage = couponRepository.findAll(pageable);
        
        List<CouponResponse> responses = couponPage.getContent().stream()
            .map(CouponResponse::fromEntity)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(PaginatedResponse.of(couponPage, responses));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> createCoupon(@Valid @RequestBody Coupon coupon) {
        if (couponRepository.findByCode(coupon.getCode()).isPresent()) {
            throw new IllegalArgumentException("Coupon code already exists.");
        }
        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.status(HttpStatus.CREATED).body(CouponResponse.fromEntity(saved));
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
                    return ResponseEntity.ok(CouponResponse.fromEntity(saved));
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
        java.util.Optional<Coupon> couponOpt = couponRepository.findByCode(code.trim().toUpperCase());
        if (couponOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid coupon code.");
        }
        Coupon coupon = couponOpt.get();
        java.time.LocalDate today = java.time.LocalDate.now();
        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            throw new IllegalArgumentException("Coupon is inactive.");
        }
        if (coupon.getStartDate() != null && today.isBefore(coupon.getStartDate())) {
            throw new IllegalArgumentException("Coupon is not active yet.");
        }
        if (coupon.getExpiryDate() != null && today.isAfter(coupon.getExpiryDate())) {
            throw new IllegalArgumentException("Coupon has expired.");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new IllegalArgumentException("Coupon usage limit reached.");
        }
        if (coupon.getMinBookingValue() != null && amount.compareTo(coupon.getMinBookingValue()) < 0) {
            throw new IllegalArgumentException("Minimum booking value of ₹" + coupon.getMinBookingValue() + " required.");
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
    }
}
