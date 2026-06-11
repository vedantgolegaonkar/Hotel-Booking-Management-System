package com.resort.management.booking.controller;

import com.resort.management.booking.dto.BookingRequest;
import com.resort.management.booking.model.Booking;
import com.resort.management.booking.repository.BookingRepository;
import com.resort.management.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.resort.management.booking.dto.BookingResponse;

@RestController
@RequestMapping("/api/v1/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping("/initiate")
    public ResponseEntity<?> initiateBooking(@Valid @RequestBody BookingRequest request) {
        try {
            Booking booking = bookingService.initiateBooking(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(BookingResponse.fromEntity(booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable UUID id) {
        return bookingRepository.findById(id)
                .map(BookingResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<BookingResponse>> searchBookings(@RequestParam(value = "search", required = false) String search) {
        List<Booking> bookings;
        if (search != null && !search.trim().isEmpty()) {
            bookings = bookingRepository.searchBookings(search);
        } else {
            bookings = bookingRepository.findAll();
        }
        List<BookingResponse> responses = bookings.stream()
            .map(BookingResponse::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> checkInGuest(@PathVariable UUID id, @Valid @RequestBody CheckInRequest request) {
        try {
            Booking booking = bookingService.assignRoomAndCheckIn(
                    id,
                    request.getAssignedRoomId(),
                    request.getIdProofType(),
                    request.getIdProofUrl()
            );
            return ResponseEntity.ok(BookingResponse.fromEntity(booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/check-out")
    @PreAuthorize("hasAnyRole('ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> checkOutGuest(@PathVariable UUID id, @Valid @RequestBody CheckOutRequest request) {
        try {
            Booking booking = bookingService.processCheckOut(
                    id,
                    request.getExtraIncidentals(),
                    request.getPaymentMethod(),
                    request.getTxRef()
            );
            return ResponseEntity.ok(BookingResponse.fromEntity(booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @Data
    public static class CheckInRequest {
        private Long assignedRoomId;
        private String idProofType; // AADHAR, PASSPORT, etc.
        private String idProofUrl;
    }

    @Data
    public static class CheckOutRequest {
        private BigDecimal extraIncidentals; // extra bed, room service charges, etc.
        private String paymentMethod; // CASH, CARD, UPI
        private String txRef; // transaction reference
    }
}
