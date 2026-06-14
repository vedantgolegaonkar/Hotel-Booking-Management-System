package com.resort.management.restaurant.repository;

import com.resort.management.restaurant.model.RestaurantBillItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RestaurantBillItemRepository extends JpaRepository<RestaurantBillItem, Long> {
    List<RestaurantBillItem> findByBillId(UUID billId);
}
