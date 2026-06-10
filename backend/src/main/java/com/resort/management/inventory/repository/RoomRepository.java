package com.resort.management.inventory.repository;

import com.resort.management.inventory.model.Room;
import com.resort.management.inventory.model.RoomCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findByCategoryAndStatus(RoomCategory category, String status);
    long countByCategory(RoomCategory category);
}
