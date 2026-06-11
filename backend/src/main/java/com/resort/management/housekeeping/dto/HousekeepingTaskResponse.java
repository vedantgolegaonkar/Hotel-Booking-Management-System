package com.resort.management.housekeeping.dto;

import com.resort.management.auth.dto.UserResponse;
import com.resort.management.housekeeping.model.HousekeepingTask;
import com.resort.management.inventory.dto.RoomResponse;

import java.time.LocalDateTime;

public record HousekeepingTaskResponse(
    Long id,
    RoomResponse room,
    UserResponse assignedTo,
    String taskStatus,
    String notes,
    LocalDateTime createdAt,
    LocalDateTime completedAt
) {
    public static HousekeepingTaskResponse fromEntity(HousekeepingTask task) {
        if (task == null) return null;
        return new HousekeepingTaskResponse(
            task.getId(),
            RoomResponse.fromEntity(task.getRoom()),
            UserResponse.fromEntity(task.getAssignedTo()),
            task.getTaskStatus(),
            task.getNotes(),
            task.getCreatedAt(),
            task.getCompletedAt()
        );
    }
}
