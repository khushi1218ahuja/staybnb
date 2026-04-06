package com.staybnb.dto;

import com.staybnb.entity.Room;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Data
@Builder
public class RoomResponse {
    private Integer id;
    private Integer hostId;
    private String hostName;
    private String title;
    private String description;
    private String type;
    private Double pricePerNight;
    private String location;
    private String city;
    private List<String> amenities;
    private List<String> images;
    private Boolean isAvailable;
    private Double avgRating;
    private Integer reviewCount;
    private LocalDateTime createdAt;

    public static RoomResponse from(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .hostId(room.getHostId())
                .hostName(room.getHost() != null ? room.getHost().getName() : null)
                .title(room.getTitle())
                .description(room.getDescription())
                .type(room.getType() != null ? room.getType().name() : null)
                .pricePerNight(room.getPricePerNight())
                .location(room.getLocation())
                .city(room.getCity())
                .amenities(room.getAmenities() != null ? Arrays.asList(room.getAmenities()) : List.of())
                .images(room.getImages() != null ? Arrays.asList(room.getImages()) : List.of())
                .isAvailable(room.getIsAvailable())
                .avgRating(room.getAvgRating())
                .reviewCount(room.getReviewCount())
                .createdAt(room.getCreatedAt())
                .build();
    }
}
