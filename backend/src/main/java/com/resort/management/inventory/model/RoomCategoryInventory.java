package com.resort.management.inventory.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(
    name = "room_category_inventory",
    uniqueConstraints = @UniqueConstraint(columnNames = {"category_id", "inventory_date"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomCategoryInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private RoomCategory category;

    @Column(name = "inventory_date", nullable = false)
    private LocalDate inventoryDate;

    @Column(name = "total_inventory", nullable = false)
    private Integer totalInventory;

    @Builder.Default
    @Column(name = "booked_count", nullable = false)
    private Integer bookedCount = 0;

    @Builder.Default
    @Column(name = "blocked_count", nullable = false)
    private Integer blockedCount = 0;

    @Version
    private Long version;
}
