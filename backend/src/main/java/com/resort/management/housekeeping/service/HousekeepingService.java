package com.resort.management.housekeeping.service;

import com.resort.management.auth.model.User;
import com.resort.management.housekeeping.model.HousekeepingTask;
import com.resort.management.housekeeping.repository.HousekeepingTaskRepository;
import com.resort.management.inventory.model.Room;
import com.resort.management.inventory.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HousekeepingService {

    @Autowired
    private HousekeepingTaskRepository taskRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Transactional
    public HousekeepingTask createCleaningTask(Room room) {
        // Change physical room status
        room.setStatus("CLEANING");
        roomRepository.save(room);

        HousekeepingTask task = HousekeepingTask.builder()
                .room(room)
                .taskStatus("PENDING")
                .notes("Room requires standard cleaning after checkout.")
                .build();

        return taskRepository.save(task);
    }

    @Transactional
    public HousekeepingTask startCleaning(Long taskId, User staff) {
        HousekeepingTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Housekeeping task not found."));

        task.setTaskStatus("IN_PROGRESS");
        task.setAssignedTo(staff);

        Room room = task.getRoom();
        room.setStatus("CLEANING");
        roomRepository.save(room);

        return taskRepository.save(task);
    }

    @Transactional
    public HousekeepingTask completeCleaning(Long taskId, String notes) {
        HousekeepingTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Housekeeping task not found."));

        task.setTaskStatus("COMPLETED");
        task.setCompletedAt(LocalDateTime.now());
        if (notes != null && !notes.trim().isEmpty()) {
            task.setNotes(notes);
        }

        Room room = task.getRoom();
        room.setStatus("AVAILABLE"); // Physical room is now ready for booking/check-in
        roomRepository.save(room);

        return taskRepository.save(task);
    }

    public List<HousekeepingTask> getActiveTasks() {
        return taskRepository.findAll().stream()
                .filter(t -> !"COMPLETED".equals(t.getTaskStatus()))
                .toList();
    }
}
