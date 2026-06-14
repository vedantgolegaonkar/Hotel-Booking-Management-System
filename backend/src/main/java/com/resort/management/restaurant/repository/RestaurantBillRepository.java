package com.resort.management.restaurant.repository;

import com.resort.management.restaurant.model.RestaurantBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface RestaurantBillRepository extends JpaRepository<RestaurantBill, UUID> {
    Optional<RestaurantBill> findByReservationId(UUID reservationId);
}
