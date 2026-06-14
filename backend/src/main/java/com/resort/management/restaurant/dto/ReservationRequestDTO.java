package com.resort.management.restaurant.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class ReservationRequestDTO {
    private LocalDate date;
    private LocalTime time;
    private Integer guestCount;
    private Long categoryId;
    private UUID customerId;
}
