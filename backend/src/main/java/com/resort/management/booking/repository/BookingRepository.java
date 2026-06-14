package com.resort.management.booking.repository;

import com.resort.management.booking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Optional<Booking> findByBookingReference(String bookingReference);
    List<Booking> findByBookingStatus(String bookingStatus);
    List<Booking> findByBookingStatusAndCreatedAtBefore(String status, LocalDateTime time);

    @EntityGraph(attributePaths = {"guest", "category", "coupon"})
    List<Booking> findByGuestEmailOrderByCreatedAtDesc(String email);

    @EntityGraph(attributePaths = {"guest", "category", "coupon"})
    @Query("SELECT b FROM Booking b WHERE LOWER(b.guest.firstName) LIKE LOWER(concat('%', :search, '%')) " +
           "OR LOWER(b.guest.lastName) LIKE LOWER(concat('%', :search, '%')) " +
           "OR LOWER(b.bookingReference) LIKE LOWER(concat('%', :search, '%'))")
    Page<Booking> searchBookings(@Param("search") String search, org.springframework.data.domain.Pageable pageable);

    List<Booking> findByCheckInDate(LocalDate date);
    List<Booking> findByCheckOutDate(LocalDate date);

    @Override
    @EntityGraph(attributePaths = {"guest", "category", "coupon"})
    Page<Booking> findAll(org.springframework.data.domain.Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"guest", "category", "coupon"})
    Optional<Booking> findById(UUID id);
}
