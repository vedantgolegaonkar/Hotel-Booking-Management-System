package com.resort.management.inventory.dto;

import com.resort.management.inventory.model.RoomCategory;
import java.math.BigDecimal;
import java.util.List;

public record RoomCategoryResponse(
    Long id,
    String name,
    String description,
    Integer capacity,
    BigDecimal basePrice,
    List<String> amenities,
    List<String> images
) {
    public static RoomCategoryResponse fromEntity(RoomCategory category) {
        if (category == null) return null;
        return new RoomCategoryResponse(
            category.getId(),
            category.getName(),
            category.getDescription(),
            category.getCapacity(),
            category.getBasePrice(),
            category.getAmenities(),
            category.getImages()
        );
    }
}
