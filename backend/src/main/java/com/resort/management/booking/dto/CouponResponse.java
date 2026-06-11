package com.resort.management.booking.dto;

import com.resort.management.booking.model.Coupon;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CouponResponse(
    Long id,
    String code,
    String discountType,
    BigDecimal discountValue,
    BigDecimal minBookingValue,
    BigDecimal maxDiscountValue,
    LocalDate startDate,
    LocalDate expiryDate,
    Integer usageLimit,
    Integer usedCount,
    Boolean isActive
) {
    public static CouponResponse fromEntity(Coupon coupon) {
        if (coupon == null) return null;
        return new CouponResponse(
            coupon.getId(),
            coupon.getCode(),
            coupon.getDiscountType(),
            coupon.getDiscountValue(),
            coupon.getMinBookingValue(),
            coupon.getMaxDiscountValue(),
            coupon.getStartDate(),
            coupon.getExpiryDate(),
            coupon.getUsageLimit(),
            coupon.getUsedCount(),
            coupon.getIsActive()
        );
    }
}
