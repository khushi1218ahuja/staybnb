package com.staybnb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StatsDto {
    private long totalUsers;
    private long totalRooms;
    private long totalBookings;
    private double totalRevenue;
    private long pendingBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private long activeListings;
}
