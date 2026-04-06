package com.staybnb.service;

import com.staybnb.dto.BookingRequest;
import com.staybnb.dto.BookingResponse;
import com.staybnb.entity.Booking;
import com.staybnb.entity.Room;
import com.staybnb.repository.BookingRepository;
import com.staybnb.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private BookingService bookingService;

    private Room testRoom;
    private Booking testBooking;

    @BeforeEach
    void setUp() {
        testRoom = Room.builder()
                .id(1)
                .hostId(10)
                .title("Cozy Flat")
                .pricePerNight(2000.0)
                .isAvailable(true)
                .city("Mumbai")
                .location("Bandra")
                .description("Nice place")
                .type(Room.RoomType.ENTIRE)
                .amenities(new String[0])
                .images(new String[0])
                .reviewCount(0)
                .build();

        testBooking = Booking.builder()
                .id(1)
                .roomId(1)
                .guestId(5)
                .checkIn(LocalDate.of(2025, 6, 1))
                .checkOut(LocalDate.of(2025, 6, 5))
                .guestCount(2)
                .totalPrice(16000.0)
                .status(Booking.BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createBooking_success() {
        BookingRequest req = new BookingRequest();
        req.setRoomId(1);
        req.setCheckIn(LocalDate.of(2025, 7, 1));
        req.setCheckOut(LocalDate.of(2025, 7, 4));
        req.setGuestCount(2);

        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.hasConflict(eq(1), any(), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);
        when(bookingRepository.findByGuestIdWithDetails(5)).thenReturn(List.of());

        BookingResponse response = bookingService.createBooking(req, 5);

        assertThat(response).isNotNull();
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void createBooking_checkoutBeforeCheckin_throws() {
        BookingRequest req = new BookingRequest();
        req.setRoomId(1);
        req.setCheckIn(LocalDate.of(2025, 7, 5));
        req.setCheckOut(LocalDate.of(2025, 7, 1));
        req.setGuestCount(1);

        assertThatThrownBy(() -> bookingService.createBooking(req, 5))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Check-out must be after check-in");
    }

    @Test
    void createBooking_roomNotAvailable_throws() {
        testRoom.setIsAvailable(false);

        BookingRequest req = new BookingRequest();
        req.setRoomId(1);
        req.setCheckIn(LocalDate.of(2025, 7, 1));
        req.setCheckOut(LocalDate.of(2025, 7, 4));
        req.setGuestCount(1);

        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));

        assertThatThrownBy(() -> bookingService.createBooking(req, 5))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not available");
    }

    @Test
    void createBooking_conflictingDates_throws() {
        BookingRequest req = new BookingRequest();
        req.setRoomId(1);
        req.setCheckIn(LocalDate.of(2025, 6, 3));
        req.setCheckOut(LocalDate.of(2025, 6, 7));
        req.setGuestCount(1);

        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.hasConflict(eq(1), any(), any())).thenReturn(true);

        assertThatThrownBy(() -> bookingService.createBooking(req, 5))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("already booked");
    }

    @Test
    void getGuestBookings_returnsList() {
        when(bookingRepository.findByGuestIdWithDetails(5)).thenReturn(List.of(testBooking));

        List<BookingResponse> results = bookingService.getGuestBookings(5);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getStatus()).isEqualTo("PENDING");
    }

    @Test
    void updateStatus_success() {
        when(bookingRepository.findById(1)).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

        BookingResponse response = bookingService.updateStatus(1, "CONFIRMED", 5, "GUEST");
        assertThat(response).isNotNull();
        verify(bookingRepository).save(any(Booking.class));
    }
}
