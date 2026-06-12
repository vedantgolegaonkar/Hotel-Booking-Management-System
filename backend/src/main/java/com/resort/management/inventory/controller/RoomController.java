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
import java.util.stream.Collectors;
import com.resort.management.inventory.dto.RoomCategoryResponse;
import com.resort.management.inventory.dto.RoomResponse;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    @Autowired
    private RoomCategoryRepository categoryRepository;

    @Autowired
    private RoomRepository roomRepository;

    @GetMapping("/categories")
    @Cacheable("categories")
    public ResponseEntity<List<RoomCategoryResponse>> getAllCategories() {
        List<RoomCategoryResponse> categories = categoryRepository.findAll().stream()
            .map(RoomCategoryResponse::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<RoomCategoryResponse> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(RoomCategoryResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/available-by-category")
    @PreAuthorize("hasAnyRole('ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getAvailableRoomsByCategory(@RequestParam("categoryId") Long categoryId) {
        RoomCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + categoryId));

        List<RoomResponse> availableRooms = roomRepository.findByCategoryAndStatus(category, "AVAILABLE").stream()
            .map(RoomResponse::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(availableRooms);
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    @CacheEvict(value = "categories", allEntries = true)
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody RoomCategory updatedCat) {
        return categoryRepository.findById(id)
                .map(cat -> {
                    cat.setName(updatedCat.getName());
                    cat.setDescription(updatedCat.getDescription());
                    cat.setCapacity(updatedCat.getCapacity());
                    cat.setBasePrice(updatedCat.getBasePrice());
                    RoomCategory saved = categoryRepository.save(cat);
                    return ResponseEntity.ok(RoomCategoryResponse.fromEntity(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
