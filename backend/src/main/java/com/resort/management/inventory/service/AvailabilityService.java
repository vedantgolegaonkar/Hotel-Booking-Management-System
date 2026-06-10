package com.resort.management.inventory.service;

import com.resort.management.inventory.model.RoomCategory;
import com.resort.management.inventory.model.RoomCategoryInventory;
import com.resort.management.inventory.repository.RoomCategoryInventoryRepository;
import com.resort.management.inventory.repository.RoomCategoryRepository;
import com.resort.management.inventory.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AvailabilityService {

    @Autowired
    private RoomCategoryRepository categoryRepository;

    @Autowired
    private RoomCategoryInventoryRepository inventoryRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Transactional(readOnly = true)
    public int getAvailableRoomsCount(Long categoryId, LocalDate checkIn, LocalDate checkOut) {
        RoomCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + categoryId));

        return getAvailableRoomsCountForCategory(category, checkIn, checkOut);
    }

    @Transactional(readOnly = true)
    public int getAvailableRoomsCountForCategory(RoomCategory category, LocalDate checkIn, LocalDate checkOut) {
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date.");
        }

        // We check inventory from checkIn to checkOut - 1 day (inclusive)
        LocalDate endDate = checkOut.minusDays(1);
        List<RoomCategoryInventory> inventories = inventoryRepository.findByCategoryAndInventoryDateBetween(category, checkIn, endDate);

        long totalRoomsCount = roomRepository.countByCategory(category);
        long totalNights = checkIn.datesUntil(checkOut).count();

        // If some days have no seeded inventory, we default to totalRoomsCount
        if (inventories.size() < totalNights) {
            int minAvail = (int) totalRoomsCount;
            // Build a map of existing dates to check
            Map<LocalDate, RoomCategoryInventory> map = new HashMap<>();
            for (RoomCategoryInventory rci : inventories) {
                map.put(rci.getInventoryDate(), rci);
            }

            for (LocalDate date = checkIn; date.isBefore(checkOut); date = date.plusDays(1)) {
                RoomCategoryInventory rci = map.get(date);
                int dailyAvail = (int) totalRoomsCount;
                if (rci != null) {
                    dailyAvail = rci.getTotalInventory() - rci.getBookedCount() - rci.getBlockedCount();
                }
                if (dailyAvail < minAvail) {
                    minAvail = dailyAvail;
                }
            }
            return Math.max(0, minAvail);
        }

        // Standard check: return min available count in the list
        int minAvailable = Integer.MAX_VALUE;
        for (RoomCategoryInventory inv : inventories) {
            int available = inv.getTotalInventory() - inv.getBookedCount() - inv.getBlockedCount();
            if (available < minAvailable) {
                minAvailable = available;
            }
        }

        return Math.max(0, minAvailable);
    }

    @Transactional(readOnly = true)
    public Map<RoomCategory, Integer> getAllCategoriesAvailability(LocalDate checkIn, LocalDate checkOut) {
        List<RoomCategory> categories = categoryRepository.findAll();
        Map<RoomCategory, Integer> availabilityMap = new HashMap<>();

        for (RoomCategory category : categories) {
            int availableCount = getAvailableRoomsCountForCategory(category, checkIn, checkOut);
            availabilityMap.put(category, availableCount);
        }

        return availabilityMap;
    }
}
