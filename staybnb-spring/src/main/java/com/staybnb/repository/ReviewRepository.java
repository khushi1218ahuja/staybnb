package com.staybnb.repository;

import com.staybnb.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.reviewer WHERE r.roomId = :roomId ORDER BY r.createdAt DESC")
    List<Review> findByRoomIdWithReviewer(@Param("roomId") Integer roomId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.roomId = :roomId")
    Double avgRatingByRoomId(@Param("roomId") Integer roomId);

    long countByRoomId(Integer roomId);

    boolean existsByRoomIdAndUserId(Integer roomId, Integer userId);
}
