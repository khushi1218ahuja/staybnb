package com.staybnb.controller;

import com.staybnb.dto.PagedResponse;
import com.staybnb.dto.RoomRequest;
import com.staybnb.dto.RoomResponse;
import com.staybnb.security.AuthenticatedUser;
import com.staybnb.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<PagedResponse<RoomResponse>> search(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {
        return ResponseEntity.ok(roomService.searchRooms(city, minPrice, maxPrice, type, search, page, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getById(id));
    }

    @PostMapping
    public ResponseEntity<RoomResponse> create(
            @Valid @RequestBody RoomRequest req,
            @AuthenticationPrincipal AuthenticatedUser auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.create(req, auth.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> update(
            @PathVariable Integer id,
            @RequestBody RoomRequest req,
            @AuthenticationPrincipal AuthenticatedUser auth) {
        return ResponseEntity.ok(roomService.update(id, req, auth.getId(), auth.getRole()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Integer id,
            @AuthenticationPrincipal AuthenticatedUser auth) {
        roomService.delete(id, auth.getId(), auth.getRole());
        return ResponseEntity.ok(Map.of("message", "Room deleted"));
    }

    @GetMapping("/host/my-listings")
    public ResponseEntity<List<RoomResponse>> myListings(@AuthenticationPrincipal AuthenticatedUser auth) {
        return ResponseEntity.ok(roomService.getHostRooms(auth.getId()));
    }
}
