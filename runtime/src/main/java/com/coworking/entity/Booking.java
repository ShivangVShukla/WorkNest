package com.coworking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "space_id", nullable = false)
    private Space space;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "desk_id")
    private Desk desk;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingType bookingType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CheckInStatus checkInStatus = CheckInStatus.NOT_CHECKED_IN;

    private LocalDateTime checkedInAt;

    private LocalDateTime checkedOutAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        if (checkInStatus == null) {
            checkInStatus = CheckInStatus.NOT_CHECKED_IN;
        }
    }

    public enum BookingType {
        DAILY, MONTHLY
    }

    public enum BookingStatus {
        CONFIRMED, CANCELLED, COMPLETED
    }

    public enum CheckInStatus {
        NOT_CHECKED_IN, CHECKED_IN, CHECKED_OUT
    }
}
