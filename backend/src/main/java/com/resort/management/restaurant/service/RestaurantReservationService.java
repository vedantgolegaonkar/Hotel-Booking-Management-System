package com.resort.management.restaurant.service;

import com.resort.management.auth.repository.UserRepository;
import com.resort.management.restaurant.dto.ReservationRequestDTO;
import com.resort.management.restaurant.model.RestaurantCategory;
import com.resort.management.restaurant.model.RestaurantReservation;
import com.resort.management.restaurant.model.RestaurantTable;
import com.resort.management.restaurant.repository.RestaurantCategoryRepository;
import com.resort.management.restaurant.repository.RestaurantReservationRepository;
import com.resort.management.restaurant.repository.RestaurantTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class RestaurantReservationService {

    @Autowired
    private RestaurantReservationRepository reservationRepository;

    @Autowired
    private RestaurantTableRepository tableRepository;

    @Autowired
    private RestaurantCategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public Integer calculateRequiredCapacity(Integer guestCount) {
        if (guestCount <= 2) return 2;
        if (guestCount <= 4) return 4;
        if (guestCount <= 6) return 6;
        return 8; // Max default mapping based on requirements
    }

    public RestaurantTable findAvailableTable(LocalDate date, LocalTime time, Integer guestCount, Long categoryId) {
        Integer requiredCapacity = calculateRequiredCapacity(guestCount);
        
        List<RestaurantTable> candidateTables = tableRepository.findByCategoryIdAndCapacityAndStatusNot(categoryId, requiredCapacity, "OUT_OF_SERVICE");
        List<RestaurantReservation> dayReservations = reservationRepository.findByReservationDateAndCategoryId(date, categoryId);

        LocalTime endTime = time.plusHours(2);

        for (RestaurantTable table : candidateTables) {
            boolean isAvailable = true;
            for (RestaurantReservation res : dayReservations) {
                if (!res.getTable().getId().equals(table.getId())) continue;
                if ("CANCELLED".equals(res.getStatus()) || "COMPLETED".equals(res.getStatus())) continue;

                LocalTime resStartTime = res.getReservationTime();
                LocalTime resEndTime = resStartTime.plusHours(2);

                // Overlap check
                if (resStartTime.isBefore(endTime) && time.isBefore(resEndTime)) {
                    isAvailable = false;
                    break;
                }
            }
            if (isAvailable) {
                return table;
            }
        }
        return null;
    }

    @Transactional
    public RestaurantReservation createReservation(ReservationRequestDTO request) {
        RestaurantTable table = findAvailableTable(request.getDate(), request.getTime(), request.getGuestCount(), request.getCategoryId());
        if (table == null) {
            throw new RuntimeException("No tables available for selected time.");
        }

        RestaurantCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        RestaurantReservation reservation = RestaurantReservation.builder()
                .customer(userRepository.findById(request.getCustomerId()).orElseThrow(() -> new RuntimeException("Customer not found")))
                .category(category)
                .table(table)
                .guestCount(request.getGuestCount())
                .reservationDate(request.getDate())
                .reservationTime(request.getTime())
                .status("PENDING")
                .build();

        // Optionally mark table as reserved if it's for right now, but usually reservations don't alter table state until seated.
        // The prompt says: "6. Mark table as Reserved." Let's do that if it's today.
        if (request.getDate().equals(LocalDate.now())) {
            table.setStatus("RESERVED");
            tableRepository.save(table);
        }

        return reservationRepository.save(reservation);
    }
}
