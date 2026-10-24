package com.coworking.service;

import com.coworking.dto.BookingRequest;
import com.coworking.dto.BookingResponse;
import com.coworking.dto.DeskAvailabilityResponse;
import com.coworking.entity.Booking;
import com.coworking.entity.Desk;
import com.coworking.entity.Space;
import com.coworking.entity.User;
import com.coworking.repository.BookingRepository;
import com.coworking.repository.DeskRepository;
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
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SpaceRepository spaceRepository;
    private final DeskRepository deskRepository;
    private final UserRepository userRepository;
    private final InvoiceService invoiceService;

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

        Desk desk = null;
        if (request.getDeskId() != null) {
            desk = deskRepository.findById(request.getDeskId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Selected desk/cabin not found"));

            if (!desk.isActive() || !desk.getSpace().getId().equals(space.getId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Desk is inactive or not part of this space");
            }

            boolean deskOverbooked = bookingRepository.existsOverlappingDeskBooking(
                    desk.getId(),
                    startDate,
                    endDate,
                    Booking.BookingStatus.CONFIRMED
            );

            if (deskOverbooked) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Desk " + desk.getDeskCode() + " is already booked for the selected dates");
            }
        } else {
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
        }

        BigDecimal totalPrice;
        double baseDayPrice = space.getPricePerDay();
        double baseMonthPrice = space.getPricePerMonth();

        // If specific cabin or premium desk has a multiplier, apply it
        if (desk != null && desk.getDailyPriceMultiplier() != null) {
            baseDayPrice = baseDayPrice * desk.getDailyPriceMultiplier().doubleValue();
            baseMonthPrice = baseMonthPrice * desk.getDailyPriceMultiplier().doubleValue();
        }

        if (request.getBookingType() == Booking.BookingType.DAILY) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
            totalPrice = BigDecimal.valueOf(baseDayPrice).multiply(BigDecimal.valueOf(days));
        } else if (request.getBookingType() == Booking.BookingType.MONTHLY) {
            long months = Period.between(startDate, endDate).toTotalMonths();
            if (startDate.plusMonths(months).isBefore(endDate)) {
                months++;
            }
            if (months < 1) {
                months = 1;
            }
            totalPrice = BigDecimal.valueOf(baseMonthPrice).multiply(BigDecimal.valueOf(months));
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid booking type");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setSpace(space);
        booking.setDesk(desk);
        booking.setBookingType(request.getBookingType());
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setTotalPrice(totalPrice.setScale(2, RoundingMode.HALF_UP));
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setCheckInStatus(Booking.CheckInStatus.NOT_CHECKED_IN);

        Booking savedBooking = bookingRepository.save(booking);

        // Automatically generate Invoice for this booking
        invoiceService.createInvoiceForBooking(savedBooking);

        return new BookingResponse(savedBooking);
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

    @Transactional
    public BookingResponse checkIn(Long bookingId, String email) {
        Booking booking = bookingRepository.findByIdAndUser_Email(bookingId, email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Cannot check in to a non-confirmed booking");
        }

        if (booking.getCheckInStatus() == Booking.CheckInStatus.CHECKED_IN) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Already checked in");
        }

        booking.setCheckInStatus(Booking.CheckInStatus.CHECKED_IN);
        booking.setCheckedInAt(LocalDateTime.now());
        return new BookingResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse checkOut(Long bookingId, String email) {
        Booking booking = bookingRepository.findByIdAndUser_Email(bookingId, email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getCheckInStatus() != Booking.CheckInStatus.CHECKED_IN) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "You must check in before checking out");
        }

        booking.setCheckInStatus(Booking.CheckInStatus.CHECKED_OUT);
        booking.setCheckedOutAt(LocalDateTime.now());
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        return new BookingResponse(bookingRepository.save(booking));
    }

    public List<DeskAvailabilityResponse> getSeatMapAvailability(Long spaceId, LocalDate startDate, LocalDate endDate) {
        List<Desk> desks = deskRepository.findBySpaceId(spaceId);
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookingsForSpace(spaceId, startDate, endDate);

        Map<Long, Booking> deskBookingMap = overlappingBookings.stream()
                .filter(b -> b.getDesk() != null)
                .collect(Collectors.toMap(b -> b.getDesk().getId(), b -> b, (b1, b2) -> b1));

        return desks.stream().map(desk -> {
            Booking activeBooking = deskBookingMap.get(desk.getId());
            boolean isAvailable = (activeBooking == null) && desk.isActive();
            Long currentBookingId = activeBooking != null ? activeBooking.getId() : null;
            String bookedBy = activeBooking != null ? activeBooking.getUser().getName() : null;

            return new DeskAvailabilityResponse(desk, isAvailable, currentBookingId, bookedBy);
        }).collect(Collectors.toList());
    }
}
