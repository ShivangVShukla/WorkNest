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
    private final String userEmail;
    private final Long spaceId;
    private final String spaceName;
    private final String spaceType;
    private final String location;
    private final Long deskId;
    private final String deskCode;
    private final String deskType;
    private final Booking.BookingType bookingType;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final BigDecimal totalPrice;
    private final Booking.BookingStatus status;
    private final Booking.CheckInStatus checkInStatus;
    private final LocalDateTime checkedInAt;
    private final LocalDateTime checkedOutAt;
    private final LocalDateTime createdAt;

    public BookingResponse(Booking booking) {
        this.id = booking.getId();
        this.userId = booking.getUser().getId();
        this.userName = booking.getUser().getName();
        this.userEmail = booking.getUser().getEmail();
        this.spaceId = booking.getSpace().getId();
        this.spaceName = booking.getSpace().getName();
        this.spaceType = booking.getSpace().getSpaceType();
        this.location = booking.getSpace().getLocation();
        if (booking.getDesk() != null) {
            this.deskId = booking.getDesk().getId();
            this.deskCode = booking.getDesk().getDeskCode();
            this.deskType = booking.getDesk().getDeskType();
        } else {
            this.deskId = null;
            this.deskCode = null;
            this.deskType = null;
        }
        this.bookingType = booking.getBookingType();
        this.startDate = booking.getStartDate();
        this.endDate = booking.getEndDate();
        this.totalPrice = booking.getTotalPrice();
        this.status = booking.getStatus();
        this.checkInStatus = booking.getCheckInStatus();
        this.checkedInAt = booking.getCheckedInAt();
        this.checkedOutAt = booking.getCheckedOutAt();
        this.createdAt = booking.getCreatedAt();
    }
}
