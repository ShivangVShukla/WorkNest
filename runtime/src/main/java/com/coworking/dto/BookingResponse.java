
package com.coworking.dto;

import com.coworking.entity.Booking;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class BookingResponse {

    private final Long id;
    private final Long userId;
    private final String userName;
    private final Long spaceId;
    private final String spaceName;
    private final String spaceType;
    private final String location;
    private final Booking.BookingType bookingType;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final BigDecimal totalPrice;
    private final Booking.BookingStatus status;
    private final LocalDateTime createdAt;

    public BookingResponse(Booking booking) {
        this.id = booking.getId();
        this.userId = booking.getUser().getId();
        this.userName = booking.getUser().getName();
        this.spaceId = booking.getSpace().getId();
        this.spaceName = booking.getSpace().getName();
        this.spaceType = booking.getSpace().getSpaceType();
        this.location = booking.getSpace().getLocation();
        this.bookingType = booking.getBookingType();
        this.startDate = booking.getStartDate();
        this.endDate = booking.getEndDate();
        this.totalPrice = booking.getTotalPrice();
        this.status = booking.getStatus();
        this.createdAt = booking.getCreatedAt();
    }
}
