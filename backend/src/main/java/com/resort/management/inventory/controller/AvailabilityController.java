package com.resort.management.inventory.controller;

import com.resort.management.inventory.model.RoomCategory;
import com.resort.management.inventory.service.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/availability")
@CrossOrigin(origins = "*")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @GetMapping
    public ResponseEntity<?> checkAvailability(
            @RequestParam("checkIn") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam("checkOut") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(value = "guests", defaultValue = "1") int guests) {

        if (checkIn.isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Check-in date cannot be in the past."));
        }
        if (!checkOut.isAfter(checkIn)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Check-out date must be after check-in date."));
        }

        Map<RoomCategory, Integer> categoryAvailability = availabilityService.getAllCategoriesAvailability(checkIn, checkOut);
        List<Map<String, Object>> responseList = new ArrayList<>();

        for (Map.Entry<RoomCategory, Integer> entry : categoryAvailability.entrySet()) {
            RoomCategory category = entry.getKey();
            int count = entry.getValue();

            // Only return categories that meet the capacity filter
            if (category.getCapacity() >= guests) {
                Map<String, Object> map = new HashMap<>();
                map.put("categoryId", category.getId());
                map.put("name", category.getName());
                map.put("description", category.getDescription());
                map.put("capacity", category.getCapacity());
                map.put("basePrice", category.getBasePrice());
                map.put("availableCount", count);
                map.put("amenities", category.getAmenities());
                map.put("images", category.getImages());
                responseList.add(map);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("checkIn", checkIn);
        response.put("checkOut", checkOut);
        response.put("guests", guests);
        response.put("categories", responseList);

        return ResponseEntity.ok(response);
    }
}
