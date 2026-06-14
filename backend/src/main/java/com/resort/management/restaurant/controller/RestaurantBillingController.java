package com.resort.management.restaurant.controller;

import com.resort.management.restaurant.model.RestaurantBill;
import com.resort.management.restaurant.model.RestaurantReservation;
import com.resort.management.restaurant.repository.RestaurantBillRepository;
import com.resort.management.restaurant.repository.RestaurantReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/restaurant/billing")
public class RestaurantBillingController {

    @Autowired
    private RestaurantBillRepository billRepository;

    @Autowired
    private RestaurantReservationRepository reservationRepository;

    @GetMapping
    public ResponseEntity<java.util.List<RestaurantBill>> getAllBills() {
        return ResponseEntity.ok(billRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createBill(@RequestBody RestaurantBill billRequest) {
        if (billRequest.getReservation() == null || billRequest.getReservation().getId() == null) {
            return ResponseEntity.badRequest().body("Reservation ID is required");
        }
        RestaurantReservation reservation = reservationRepository.findById(billRequest.getReservation().getId()).orElse(null);
        if (reservation == null) {
            return ResponseEntity.badRequest().body("Reservation not found");
        }
        
        billRequest.setReservation(reservation);
        billRequest.setCustomer(reservation.getCustomer());
        
        RestaurantBill savedBill = billRepository.save(billRequest);
        
        // Update reservation status
        reservation.setStatus("COMPLETED");
        reservationRepository.save(reservation);
        
        return ResponseEntity.ok(savedBill);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantBill> getBill(@PathVariable UUID id) {
        return billRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<RestaurantBill> getBillByReservation(@PathVariable UUID reservationId) {
        return billRepository.findByReservationId(reservationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
