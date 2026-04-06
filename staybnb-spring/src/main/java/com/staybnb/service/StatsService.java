package com.staybnb.service;

import com.staybnb.dto.StatsDto;
import com.staybnb.entity.Booking;
import com.staybnb.entity.User;
import com.staybnb.repository.BookingRepository;
import com.staybnb.repository.RoomRepository;
import com.staybnb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public StatsDto getPlatformStats() {
        return StatsDto.builder()
                .totalUsers(userRepository.count())
                .totalRooms(roomRepository.count())
                .totalBookings(bookingRepository.count())
                .totalRevenue(defaultRevenue(bookingRepository.sumRevenue()))
                .pendingBookings(bookingRepository.countByStatus(Booking.BookingStatus.PENDING))
                .confirmedBookings(bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED))
                .cancelledBookings(bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED))
                .activeListings(roomRepository.countByIsAvailable(true))
                .build();
    }

    public Map<String, Object> getHostStats(Integer hostId) {
        long totalListings = roomRepository.findByHostId(hostId).size();
        long activeListings = roomRepository.findByHostId(hostId).stream()
                .filter(r -> r.getIsAvailable()).count();
        long totalBookings = bookingRepository.findByHostIdWithDetails(hostId).size();
        long pendingBookings = bookingRepository.findByHostIdWithDetails(hostId).stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.PENDING).count();
        double revenue = defaultRevenue(bookingRepository.sumRevenueByHostId(hostId));

        return Map.of(
                "totalListings", totalListings,
                "activeListings", activeListings,
                "totalBookings", totalBookings,
                "pendingBookings", pendingBookings,
                "totalRevenue", revenue
        );
    }

    private double defaultRevenue(Double value) {
        return value != null ? value : 0.0;
    }
}
