package com.staybnb.service;

import com.staybnb.dto.BookingRequest;
import com.staybnb.dto.BookingResponse;
import com.staybnb.entity.Booking;
import com.staybnb.entity.Room;
import com.staybnb.repository.BookingRepository;
import com.staybnb.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public BookingResponse createBooking(BookingRequest req, Integer guestId) {
        if (!req.getCheckOut().isAfter(req.getCheckIn())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-out must be after check-in");
        }

        Room room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        if (!room.getIsAvailable()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Room is not available");
        }

        if (bookingRepository.hasConflict(req.getRoomId(), req.getCheckIn(), req.getCheckOut())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Room is already booked for the selected dates");
        }

        long nights = ChronoUnit.DAYS.between(req.getCheckIn(), req.getCheckOut());
        double totalPrice = room.getPricePerNight() * nights * req.getGuestCount();

        Booking booking = Booking.builder()
                .roomId(req.getRoomId())
                .guestId(guestId)
                .checkIn(req.getCheckIn())
                .checkOut(req.getCheckOut())
                .guestCount(req.getGuestCount())
                .totalPrice(totalPrice)
                .status(Booking.BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return bookingRepository.findByGuestIdWithDetails(guestId)
                .stream().filter(b -> b.getId().equals(saved.getId()))
                .map(BookingResponse::from).findFirst()
                .orElse(BookingResponse.from(saved));
    }

    public List<BookingResponse> getGuestBookings(Integer guestId) {
        return bookingRepository.findByGuestIdWithDetails(guestId)
                .stream().map(BookingResponse::from).toList();
    }

    public List<BookingResponse> getHostBookings(Integer hostId) {
        return bookingRepository.findByHostIdWithDetails(hostId)
                .stream().map(BookingResponse::from).toList();
    }

    public BookingResponse updateStatus(Integer id, String status, Integer userId, String role) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        Booking.BookingStatus newStatus;
        try {
            newStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }

        if (role.equals("GUEST") && !booking.getGuestId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        if (role.equals("HOST")) {
            Room room = roomRepository.findById(booking.getRoomId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
            if (!room.getHostId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
        }

        booking.setStatus(newStatus);
        return BookingResponse.from(bookingRepository.save(booking));
    }
}
