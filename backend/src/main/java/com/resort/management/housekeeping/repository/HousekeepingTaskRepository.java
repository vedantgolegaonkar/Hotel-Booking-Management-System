package com.resort.management.housekeeping.repository;

import com.resort.management.housekeeping.model.HousekeepingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface HousekeepingTaskRepository extends JpaRepository<HousekeepingTask, Long> {
    
    @EntityGraph(attributePaths = {"room", "assignedTo"})
    List<HousekeepingTask> findByTaskStatus(String taskStatus);
    
    @EntityGraph(attributePaths = {"room", "assignedTo"})
    Page<HousekeepingTask> findByTaskStatusNot(String taskStatus, Pageable pageable);
    
    @EntityGraph(attributePaths = {"room", "assignedTo"})
    List<HousekeepingTask> findByRoomId(Long roomId);
    
    @EntityGraph(attributePaths = {"room", "assignedTo"})
    Optional<HousekeepingTask> findFirstByRoomIdAndTaskStatusNot(Long roomId, String taskStatus);

    @Override
    @EntityGraph(attributePaths = {"room", "assignedTo"})
    Page<HousekeepingTask> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"room", "assignedTo"})
    Optional<HousekeepingTask> findById(Long id);
}
