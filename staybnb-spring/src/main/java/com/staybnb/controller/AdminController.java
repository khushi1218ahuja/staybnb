package com.staybnb.controller;

import com.staybnb.dto.BookingResponse;
import com.staybnb.dto.RoomResponse;
import com.staybnb.dto.UserDto;
import com.staybnb.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Integer id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(adminService.getAllRooms());
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<Map<String, String>> deleteRoom(@PathVariable Integer id) {
        adminService.deleteRoom(id);
        return ResponseEntity.ok(Map.of("message", "Room deleted"));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.updateBookingStatus(id, body.get("status")));
    }
}
