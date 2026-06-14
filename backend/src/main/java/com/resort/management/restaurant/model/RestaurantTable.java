package com.resort.management.restaurant.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurant_tables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private RestaurantCategory category;

    @Column(name = "table_number", nullable = false, unique = true, length = 20)
    private String tableNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "AVAILABLE"; // AVAILABLE, RESERVED, OCCUPIED, OUT_OF_SERVICE
}
