package com.resort.management.housekeeping.repository;

import com.resort.management.housekeeping.model.HousekeepingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HousekeepingTaskRepository extends JpaRepository<HousekeepingTask, Long> {
    List<HousekeepingTask> findByTaskStatus(String taskStatus);
    List<HousekeepingTask> findByRoomId(Long roomId);
    Optional<HousekeepingTask> findFirstByRoomIdAndTaskStatusNot(Long roomId, String taskStatus);
}
