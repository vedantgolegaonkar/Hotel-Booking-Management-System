package com.resort.management.restaurant.repository;

import com.resort.management.restaurant.model.RestaurantCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantCategoryRepository extends JpaRepository<RestaurantCategory, Long> {
}
