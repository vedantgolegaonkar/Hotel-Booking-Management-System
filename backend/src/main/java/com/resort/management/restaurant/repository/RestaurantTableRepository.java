package com.resort.management.restaurant.repository;

import com.resort.management.restaurant.model.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    List<RestaurantTable> findByCategoryId(Long categoryId);
    List<RestaurantTable> findByCategoryIdAndCapacityAndStatusNot(Long categoryId, Integer capacity, String status);
}
