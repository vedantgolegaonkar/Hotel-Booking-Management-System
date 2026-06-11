package com.resort.management.inventory.dto;

import com.resort.management.inventory.model.Room;

public record RoomResponse(
    Long id,
    String roomNumber,
    RoomCategoryResponse category,
    Integer floor,
    String status
) {
    public static RoomResponse fromEntity(Room room) {
        if (room == null) return null;
        return new RoomResponse(
            room.getId(),
            room.getRoomNumber(),
            RoomCategoryResponse.fromEntity(room.getCategory()),
            room.getFloor(),
            room.getStatus()
        );
    }
}
