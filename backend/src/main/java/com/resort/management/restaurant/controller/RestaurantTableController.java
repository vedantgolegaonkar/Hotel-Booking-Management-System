package com.resort.management.restaurant.controller;

import com.resort.management.restaurant.model.RestaurantCategory;
import com.resort.management.restaurant.model.RestaurantTable;
import com.resort.management.restaurant.repository.RestaurantCategoryRepository;
import com.resort.management.restaurant.repository.RestaurantTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurant/tables")
public class RestaurantTableController {

    @Autowired
    private RestaurantTableRepository tableRepository;

    @Autowired
    private RestaurantCategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<RestaurantTable>> getAllTables() {
        return ResponseEntity.ok(tableRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createTable(@RequestBody RestaurantTable table) {
        if (table.getCategory() == null || table.getCategory().getId() == null) {
            return ResponseEntity.badRequest().body("Category ID is required");
        }
        RestaurantCategory category = categoryRepository.findById(table.getCategory().getId()).orElse(null);
        if (category == null) {
            return ResponseEntity.badRequest().body("Category not found");
        }
        table.setCategory(category);
        return ResponseEntity.ok(tableRepository.save(table));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTable> updateTable(@PathVariable Long id, @RequestBody RestaurantTable tableDetails) {
        return tableRepository.findById(id).map(table -> {
            table.setTableNumber(tableDetails.getTableNumber());
            table.setCapacity(tableDetails.getCapacity());
            table.setStatus(tableDetails.getStatus());
            if (tableDetails.getCategory() != null && tableDetails.getCategory().getId() != null) {
                categoryRepository.findById(tableDetails.getCategory().getId()).ifPresent(table::setCategory);
            }
            return ResponseEntity.ok(tableRepository.save(table));
        }).orElse(ResponseEntity.notFound().build());
    }
}
