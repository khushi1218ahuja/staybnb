package com.staybnb.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class RoomRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String type;

    @NotNull
    @Positive
    private Double pricePerNight;

    @NotBlank
    private String location;

    @NotBlank
    private String city;

    private List<String> amenities;
    private List<String> images;
    private Boolean isAvailable;
}
