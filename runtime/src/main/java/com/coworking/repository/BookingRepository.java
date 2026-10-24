package com.coworking.repository;

import com.coworking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
            SELECT COUNT(b) > 0
            FROM Booking b
            WHERE b.space.id = :spaceId
            AND b.status = :status
            AND b.startDate < :endDate
            AND b.endDate > :startDate
            """)
    boolean existsOverlappingBooking(
            @Param("spaceId") Long spaceId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") Booking.BookingStatus status
    );

    @Query("""
            SELECT COUNT(b) > 0
            FROM Booking b
            WHERE b.desk.id = :deskId
            AND b.status = :status
            AND b.startDate < :endDate
            AND b.endDate > :startDate
            """)
    boolean existsOverlappingDeskBooking(
            @Param("deskId") Long deskId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") Booking.BookingStatus status
    );

    @Query("""
            SELECT b
            FROM Booking b
            WHERE b.space.id = :spaceId
            AND b.status = 'CONFIRMED'
            AND b.startDate < :endDate
            AND b.endDate > :startDate
            """)
    List<Booking> findOverlappingBookingsForSpace(
            @Param("spaceId") Long spaceId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT COUNT(b) > 0
        FROM Booking b
        WHERE b.space.id = :spaceId
        AND b.status = 'CONFIRMED'
        AND b.startDate < :endDate
        AND b.endDate > :startDate
        """)
    boolean existsConfirmedBookingOverlap(
            @Param("spaceId") Long spaceId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    Optional<Booking> findByIdAndUser_Email(Long id, String email);
    List<Booking> findByUser_EmailOrderByCreatedAtDesc(String email);
}
