package com.resort.management.restaurant.controller;

import com.resort.management.restaurant.model.MenuCategory;
import com.resort.management.restaurant.model.MenuItem;
import com.resort.management.restaurant.repository.MenuCategoryRepository;
import com.resort.management.restaurant.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu")
public class MenuController {

    @Autowired
    private MenuCategoryRepository categoryRepository;

    @Autowired
    private MenuItemRepository itemRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<MenuCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/categories")
    public ResponseEntity<MenuCategory> createCategory(@RequestBody MenuCategory category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @GetMapping("/items")
    public ResponseEntity<List<MenuItem>> getAllItems() {
        return ResponseEntity.ok(itemRepository.findAll());
    }

    @PostMapping("/items")
    public ResponseEntity<?> createItem(@RequestBody MenuItem item) {
        if (item.getCategory() == null || item.getCategory().getId() == null) {
            return ResponseEntity.badRequest().body("Category ID is required");
        }
        MenuCategory category = categoryRepository.findById(item.getCategory().getId()).orElse(null);
        if (category == null) {
            return ResponseEntity.badRequest().body("Category not found");
        }
        item.setCategory(category);
        return ResponseEntity.ok(itemRepository.save(item));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<MenuItem> updateItem(@PathVariable Long id, @RequestBody MenuItem itemDetails) {
        return itemRepository.findById(id).map(item -> {
            item.setName(itemDetails.getName());
            item.setDescription(itemDetails.getDescription());
            item.setPrice(itemDetails.getPrice());
            item.setIsActive(itemDetails.getIsActive());
            if (itemDetails.getCategory() != null && itemDetails.getCategory().getId() != null) {
                categoryRepository.findById(itemDetails.getCategory().getId()).ifPresent(item::setCategory);
            }
            return ResponseEntity.ok(itemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        return itemRepository.findById(id).map(item -> {
            item.setIsActive(false);
            itemRepository.save(item);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
