package com.resort.management.housekeeping.repository;

import com.resort.management.housekeeping.model.HousekeepingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;

@Repository
public interface HousekeepingTaskRepository extends JpaRepository<HousekeepingTask, Long> {
    
    @EntityGraph(attributePaths = {"room", "assignedTo"})
    List<HousekeepingTask> findByTaskStatus(String taskStatus);
    
    @EntityGraph(attributePaths = {"room", "assignedTo"})
    List<HousekeepingTask> findByRoomId(Long roomId);
    
    @EntityGraph(attributePaths = {"room", "assignedTo"})
    Optional<HousekeepingTask> findFirstByRoomIdAndTaskStatusNot(Long roomId, String taskStatus);

    @Override
    @EntityGraph(attributePaths = {"room", "assignedTo"})
    List<HousekeepingTask> findAll();

    @Override
    @EntityGraph(attributePaths = {"room", "assignedTo"})
    Optional<HousekeepingTask> findById(Long id);
}
