package com.staybnb.service;

import com.staybnb.dto.BookingResponse;
import com.staybnb.dto.RoomResponse;
import com.staybnb.dto.UserDto;
import com.staybnb.entity.Booking;
import com.staybnb.entity.User;
import com.staybnb.repository.BookingRepository;
import com.staybnb.repository.RoomRepository;
import com.staybnb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(UserDto::from).toList();
    }

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream().map(RoomResponse::from).toList();
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllWithDetails().stream().map(BookingResponse::from).toList();
    }

    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getRole() == User.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete admin user");
        }
        userRepository.delete(user);
    }

    public void deleteRoom(Integer id) {
        if (!roomRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found");
        }
        roomRepository.deleteById(id);
    }

    public BookingResponse updateBookingStatus(Integer id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        Booking.BookingStatus newStatus;
        try {
            newStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }

        booking.setStatus(newStatus);
        return BookingResponse.from(bookingRepository.save(booking));
    }
}
