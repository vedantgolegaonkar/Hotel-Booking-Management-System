package com.resort.management.inventory.controller;

import com.resort.management.inventory.model.Room;
import com.resort.management.inventory.model.RoomCategory;
import com.resort.management.inventory.repository.RoomCategoryRepository;
import com.resort.management.inventory.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    @Autowired
    private RoomCategoryRepository categoryRepository;

    @Autowired
    private RoomRepository roomRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<RoomCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<RoomCategory> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/available-by-category")
    @PreAuthorize("hasAnyRole('ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getAvailableRoomsByCategory(@RequestParam("categoryId") Long categoryId) {
        RoomCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + categoryId));

        List<Room> availableRooms = roomRepository.findByCategoryAndStatus(category, "AVAILABLE");
        return ResponseEntity.ok(availableRooms);
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody RoomCategory updatedCat) {
        return categoryRepository.findById(id)
                .map(cat -> {
                    cat.setName(updatedCat.getName());
                    cat.setDescription(updatedCat.getDescription());
                    cat.setCapacity(updatedCat.getCapacity());
                    cat.setBasePrice(updatedCat.getBasePrice());
                    RoomCategory saved = categoryRepository.save(cat);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
