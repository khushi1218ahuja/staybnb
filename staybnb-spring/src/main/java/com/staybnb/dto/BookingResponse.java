package com.staybnb.dto;

import com.staybnb.entity.Booking;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Integer id;
    private Integer roomId;
    private Integer guestId;
    private String guestName;
    private String guestEmail;
    private RoomResponse room;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer guestCount;
    private Double totalPrice;
    private String status;
    private String paymentStatus;
    private String transactionId;
    private LocalDateTime createdAt;

    public static BookingResponse from(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .roomId(b.getRoomId())
                .guestId(b.getGuestId())
                .guestName(b.getGuest() != null ? b.getGuest().getName() : null)
                .guestEmail(b.getGuest() != null ? b.getGuest().getEmail() : null)
                .room(b.getRoom() != null ? RoomResponse.from(b.getRoom()) : null)
                .checkIn(b.getCheckIn())
                .checkOut(b.getCheckOut())
                .guestCount(b.getGuestCount())
                .totalPrice(b.getTotalPrice())
                .status(b.getStatus() != null ? b.getStatus().name() : null)
                .paymentStatus(b.getPaymentStatus())
                .transactionId(b.getTransactionId())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
