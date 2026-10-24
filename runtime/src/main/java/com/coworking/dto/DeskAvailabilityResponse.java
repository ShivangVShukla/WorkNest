package com.coworking.dto;

import com.coworking.entity.Desk;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeskAvailabilityResponse {
    private Long id;
    private Long spaceId;
    private String deskCode;
    private String deskType;
    private Integer rowNumber;
    private Integer colNumber;
    private Integer capacity;
    private boolean active;
    private boolean available;
    private Long currentBookingId;
    private String bookedBy;

    public DeskAvailabilityResponse(Desk desk, boolean available, Long currentBookingId, String bookedBy) {
        this.id = desk.getId();
        this.spaceId = desk.getSpace().getId();
        this.deskCode = desk.getDeskCode();
        this.deskType = desk.getDeskType();
        this.rowNumber = desk.getRowNumber();
        this.colNumber = desk.getColNumber();
        this.capacity = desk.getCapacity();
        this.active = desk.isActive();
        this.available = available;
        this.currentBookingId = currentBookingId;
        this.bookedBy = bookedBy;
    }
}
