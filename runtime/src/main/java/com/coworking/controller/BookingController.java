
package com.coworking.controller;

import com.coworking.dto.BookingRequest;
import com.coworking.dto.BookingResponse;
import com.coworking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

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

}
