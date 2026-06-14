package com.resort.management.restaurant.repository;

import com.resort.management.restaurant.model.RestaurantReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface RestaurantReservationRepository extends JpaRepository<RestaurantReservation, UUID> {
    List<RestaurantReservation> findByReservationDateAndCategoryId(LocalDate reservationDate, Long categoryId);
    List<RestaurantReservation> findByCustomerIdOrderByReservationDateDescReservationTimeDesc(UUID customerId);
}
