package com.staybnb.repository;

import com.staybnb.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.room r LEFT JOIN FETCH r.host LEFT JOIN FETCH b.guest WHERE b.guestId = :guestId ORDER BY b.createdAt DESC")
    List<Booking> findByGuestIdWithDetails(@Param("guestId") Integer guestId);

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.room r LEFT JOIN FETCH r.host LEFT JOIN FETCH b.guest WHERE r.hostId = :hostId ORDER BY b.createdAt DESC")
    List<Booking> findByHostIdWithDetails(@Param("hostId") Integer hostId);

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.room LEFT JOIN FETCH b.guest ORDER BY b.createdAt DESC")
    List<Booking> findAllWithDetails();

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Booking b WHERE " +
           "b.roomId = :roomId AND b.status != 'CANCELLED' AND " +
           "b.checkIn < :checkOut AND b.checkOut > :checkIn")
    boolean hasConflict(
            @Param("roomId") Integer roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status = 'CONFIRMED'")
    Double sumRevenue();

    long countByStatus(Booking.BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.room.hostId = :hostId AND b.status = 'CONFIRMED'")
    Double sumRevenueByHostId(@Param("hostId") Integer hostId);

    long countByRoomIdAndGuestId(Integer roomId, Integer guestId);
}
