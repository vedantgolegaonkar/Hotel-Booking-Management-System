package com.resort.management.restaurant.controller;

import com.resort.management.restaurant.dto.ReservationRequestDTO;
import com.resort.management.restaurant.model.RestaurantReservation;
import com.resort.management.restaurant.model.RestaurantTable;
import com.resort.management.restaurant.repository.RestaurantReservationRepository;
import com.resort.management.restaurant.service.RestaurantReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurant")
public class RestaurantReservationController {

    @Autowired
    private RestaurantReservationService reservationService;

    @Autowired
    private RestaurantReservationRepository reservationRepository;

    @GetMapping("/availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam LocalDate date,
            @RequestParam LocalTime time,
            @RequestParam Integer guestCount,
            @RequestParam Long categoryId) {
        RestaurantTable table = reservationService.findAvailableTable(date, time, guestCount, categoryId);
        if (table != null) {
            return ResponseEntity.ok(Map.of("available", true, "tableId", table.getId()));
        } else {
            return ResponseEntity.ok(Map.of("available", false, "message", "No tables available for selected time."));
        }
    }

    @PostMapping("/reservations")
    public ResponseEntity<?> createReservation(@RequestBody ReservationRequestDTO request) {
        try {
            RestaurantReservation reservation = reservationService.createReservation(request);
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reservations")
    public ResponseEntity<List<RestaurantReservation>> getAllReservations() {
        return ResponseEntity.ok(reservationRepository.findAll());
    }

    @GetMapping("/reservations/customer/{customerId}")
    public ResponseEntity<List<RestaurantReservation>> getCustomerReservations(@PathVariable UUID customerId) {
        return ResponseEntity.ok(reservationRepository.findByCustomerIdOrderByReservationDateDescReservationTimeDesc(customerId));
    }

    @GetMapping("/reservations/{id}")
    public ResponseEntity<RestaurantReservation> getReservation(@PathVariable UUID id) {
        return reservationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/reservations/{id}")
    public ResponseEntity<RestaurantReservation> updateReservationStatus(@PathVariable UUID id, @RequestBody Map<String, String> payload) {
        return reservationRepository.findById(id).map(res -> {
            if (payload.containsKey("status")) {
                res.setStatus(payload.get("status"));
            }
            return ResponseEntity.ok(reservationRepository.save(res));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<?> cancelReservation(@PathVariable UUID id) {
        return reservationRepository.findById(id).map(res -> {
            res.setStatus("CANCELLED");
            reservationRepository.save(res);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
