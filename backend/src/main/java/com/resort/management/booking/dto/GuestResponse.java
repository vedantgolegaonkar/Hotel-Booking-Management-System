package com.resort.management.booking.dto;

import com.resort.management.booking.model.Guest;

import java.util.UUID;

public record GuestResponse(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String mobile
) {
    public static GuestResponse fromEntity(Guest guest) {
        if (guest == null) return null;
        return new GuestResponse(
            guest.getId(),
            guest.getFirstName(),
            guest.getLastName(),
            guest.getEmail(),
            guest.getMobile()
        );
    }
}
