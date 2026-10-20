
package com.coworking.service;

import com.coworking.dto.BookingRequest;
import com.coworking.entity.Booking;
import com.coworking.entity.Space;
import com.coworking.entity.User;
import com.coworking.repository.BookingRepository;
import com.coworking.repository.SpaceRepository;
import com.coworking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import com.coworking.dto.BookingResponse;
import com.coworking.dto.BookingResponse;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SpaceRepository spaceRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        Space space = spaceRepository.findById(request.getSpaceId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Space not found"));

        if (!space.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "This space is not available");
        }

        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        if (startDate == null || endDate == null ||
                !endDate.isAfter(startDate) ||
                startDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid booking dates");
        }

        boolean alreadyBooked = bookingRepository.existsOverlappingBooking(
                space.getId(),
                startDate,
                endDate,
                Booking.BookingStatus.CONFIRMED
        );

        if (alreadyBooked) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This space is already booked for the selected dates");
        }

        BigDecimal totalPrice;

        if (request.getBookingType() == Booking.BookingType.DAILY) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(
                    startDate, endDate);

            totalPrice = BigDecimal.valueOf(space.getPricePerDay())
                    .multiply(BigDecimal.valueOf(days));
        } else if (request.getBookingType() == Booking.BookingType.MONTHLY) {
            long months = Period.between(startDate, endDate).toTotalMonths();

            if (startDate.plusMonths(months).isBefore(endDate)) {
                months++;
            }

            if (months < 1) {
                months = 1;
            }

            totalPrice = BigDecimal.valueOf(space.getPricePerMonth())
                    .multiply(BigDecimal.valueOf(months));
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid booking type");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setSpace(space);
        booking.setBookingType(request.getBookingType());
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setTotalPrice(totalPrice.setScale(2, RoundingMode.HALF_UP));
        booking.setStatus(Booking.BookingStatus.CONFIRMED);

        return new BookingResponse(bookingRepository.save(booking));
    }

    public List<BookingResponse> getMyBookings(String email) {
        return bookingRepository.findByUser_EmailOrderByCreatedAtDesc(email)
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }


    @Transactional
    public BookingResponse cancelBooking(Long bookingId, String email) {
        Booking booking = bookingRepository.findByIdAndUser_Email(bookingId, email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only confirmed bookings can be cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);

        return new BookingResponse(bookingRepository.save(booking));
    }

}
