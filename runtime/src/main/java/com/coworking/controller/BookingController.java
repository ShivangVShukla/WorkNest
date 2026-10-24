package com.coworking.controller;

import com.coworking.dto.BookingRequest;
import com.coworking.dto.BookingResponse;
import com.coworking.dto.DeskAvailabilityResponse;
import com.coworking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {
        return bookingService.createBooking(
                request,
                authentication.getName()
        );
    }

    @GetMapping("/myBookings")
    public List<BookingResponse> getMyBookings(Authentication authentication) {
        return bookingService.getMyBookings(authentication.getName());
    }

    @PatchMapping("/{id}/cancel")
    public BookingResponse cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        return bookingService.cancelBooking(id, authentication.getName());
    }

    @PatchMapping("/{id}/check-in")
    public BookingResponse checkIn(
            @PathVariable Long id,
            Authentication authentication) {
        return bookingService.checkIn(id, authentication.getName());
    }

    @PatchMapping("/{id}/check-out")
    public BookingResponse checkOut(
            @PathVariable Long id,
            Authentication authentication) {
        return bookingService.checkOut(id, authentication.getName());
    }

    @GetMapping("/spaces/{spaceId}/seat-map")
    public List<DeskAvailabilityResponse> getSeatMap(
            @PathVariable Long spaceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return bookingService.getSeatMapAvailability(spaceId, startDate, endDate);
    }
}
