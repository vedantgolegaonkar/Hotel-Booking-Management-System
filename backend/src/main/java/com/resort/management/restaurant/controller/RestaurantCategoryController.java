package com.resort.management.restaurant.controller;

import com.resort.management.restaurant.model.RestaurantCategory;
import com.resort.management.restaurant.repository.RestaurantCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurant/categories")
public class RestaurantCategoryController {

    @Autowired
    private RestaurantCategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<RestaurantCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<RestaurantCategory> createCategory(@RequestBody RestaurantCategory category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantCategory> updateCategory(@PathVariable Long id, @RequestBody RestaurantCategory categoryDetails) {
        return categoryRepository.findById(id).map(category -> {
            category.setName(categoryDetails.getName());
            category.setDescription(categoryDetails.getDescription());
            category.setIsActive(categoryDetails.getIsActive());
            return ResponseEntity.ok(categoryRepository.save(category));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id).map(category -> {
            category.setIsActive(false);
            categoryRepository.save(category);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
