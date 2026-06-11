package com.resort.management.booking.dto;

import com.resort.management.booking.model.Booking;
import com.resort.management.inventory.dto.RoomCategoryResponse;
import com.resort.management.inventory.dto.RoomResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record BookingResponse(
    UUID id,
    String bookingReference,
    GuestResponse guest,
    RoomCategoryResponse category,
    LocalDate checkInDate,
    LocalDate checkOutDate,
    Integer adultsCount,
    Integer childrenCount,
    String bookingStatus,
    CouponResponse coupon,
    BigDecimal baseAmount,
    BigDecimal discountAmount,
    BigDecimal taxAmount,
    BigDecimal grandTotal,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Set<RoomResponse> assignedRooms
) {
    public static BookingResponse fromEntity(Booking booking) {
        if (booking == null) return null;
        
        Set<RoomResponse> roomResponses = null;
        if (booking.getAssignedRooms() != null) {
            roomResponses = booking.getAssignedRooms().stream()
                .map(RoomResponse::fromEntity)
                .collect(Collectors.toSet());
        }

        return new BookingResponse(
            booking.getId(),
            booking.getBookingReference(),
            GuestResponse.fromEntity(booking.getGuest()),
            RoomCategoryResponse.fromEntity(booking.getCategory()),
            booking.getCheckInDate(),
            booking.getCheckOutDate(),
            booking.getAdultsCount(),
            booking.getChildrenCount(),
            booking.getBookingStatus(),
            CouponResponse.fromEntity(booking.getCoupon()),
            booking.getBaseAmount(),
            booking.getDiscountAmount(),
            booking.getTaxAmount(),
            booking.getGrandTotal(),
            booking.getCreatedAt(),
            booking.getUpdatedAt(),
            roomResponses
        );
    }
}
