package com.staybnb.service;

import com.staybnb.dto.PagedResponse;
import com.staybnb.dto.RoomRequest;
import com.staybnb.dto.RoomResponse;
import com.staybnb.entity.Room;
import com.staybnb.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    public PagedResponse<RoomResponse> searchRooms(String city, Double minPrice, Double maxPrice,
                                                    String type, String search, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Room> roomPage = roomRepository.searchRooms(city, minPrice, maxPrice, type, search, pageable);

        List<RoomResponse> data = roomPage.getContent().stream().map(RoomResponse::from).toList();
        return PagedResponse.<RoomResponse>builder()
                .data(data)
                .page(page)
                .limit(limit)
                .total(roomPage.getTotalElements())
                .totalPages(roomPage.getTotalPages())
                .build();
    }

    public RoomResponse getById(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
        return RoomResponse.from(room);
    }

    public RoomResponse create(RoomRequest req, Integer hostId) {
        Room.RoomType type;
        try {
            type = Room.RoomType.valueOf(req.getType().toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid room type");
        }

        Room room = Room.builder()
                .hostId(hostId)
                .title(req.getTitle())
                .description(req.getDescription())
                .type(type)
                .pricePerNight(req.getPricePerNight())
                .location(req.getLocation())
                .city(req.getCity())
                .amenities(req.getAmenities() != null ? req.getAmenities().toArray(new String[0]) : new String[0])
                .images(req.getImages() != null ? req.getImages().toArray(new String[0]) : new String[0])
                .isAvailable(req.getIsAvailable() != null ? req.getIsAvailable() : true)
                .build();

        return RoomResponse.from(roomRepository.save(room));
    }

    public RoomResponse update(Integer id, RoomRequest req, Integer hostId, String role) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        if (!role.equals("ADMIN") && !room.getHostId().equals(hostId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        if (req.getTitle() != null) room.setTitle(req.getTitle());
        if (req.getDescription() != null) room.setDescription(req.getDescription());
        if (req.getType() != null) room.setType(Room.RoomType.valueOf(req.getType().toUpperCase()));
        if (req.getPricePerNight() != null) room.setPricePerNight(req.getPricePerNight());
        if (req.getLocation() != null) room.setLocation(req.getLocation());
        if (req.getCity() != null) room.setCity(req.getCity());
        if (req.getAmenities() != null) room.setAmenities(req.getAmenities().toArray(new String[0]));
        if (req.getImages() != null) room.setImages(req.getImages().toArray(new String[0]));
        if (req.getIsAvailable() != null) room.setIsAvailable(req.getIsAvailable());

        return RoomResponse.from(roomRepository.save(room));
    }

    public void delete(Integer id, Integer hostId, String role) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        if (!role.equals("ADMIN") && !room.getHostId().equals(hostId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        roomRepository.delete(room);
    }

    public List<RoomResponse> getHostRooms(Integer hostId) {
        return roomRepository.findByHostId(hostId).stream().map(RoomResponse::from).toList();
    }

    public List<RoomResponse> getFeatured() {
        return roomRepository.findFeaturedRooms(PageRequest.of(0, 6))
                .stream().map(RoomResponse::from).toList();
    }

    public List<String> getCities() {
        return roomRepository.findDistinctCities();
    }
}
