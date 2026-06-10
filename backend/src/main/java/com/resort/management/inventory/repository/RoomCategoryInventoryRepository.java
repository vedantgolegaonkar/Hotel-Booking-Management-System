package com.resort.management.inventory.repository;

import com.resort.management.inventory.model.RoomCategory;
import com.resort.management.inventory.model.RoomCategoryInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomCategoryInventoryRepository extends JpaRepository<RoomCategoryInventory, Long> {
    Optional<RoomCategoryInventory> findByCategoryAndInventoryDate(RoomCategory category, LocalDate date);
    List<RoomCategoryInventory> findByCategoryAndInventoryDateBetween(RoomCategory category, LocalDate startDate, LocalDate endDate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT rci FROM RoomCategoryInventory rci WHERE rci.category = :category AND rci.inventoryDate BETWEEN :startDate AND :endDate")
    List<RoomCategoryInventory> findByCategoryAndInventoryDateBetweenWithLock(
            @Param("category") RoomCategory category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
