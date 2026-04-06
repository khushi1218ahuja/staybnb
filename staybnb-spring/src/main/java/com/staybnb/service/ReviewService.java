package com.staybnb.service;

import com.staybnb.dto.ReviewRequest;
import com.staybnb.dto.ReviewResponse;
import com.staybnb.entity.Review;
import com.staybnb.entity.Room;
import com.staybnb.repository.BookingRepository;
import com.staybnb.repository.ReviewRepository;
import com.staybnb.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public List<ReviewResponse> getRoomReviews(Integer roomId) {
        return reviewRepository.findByRoomIdWithReviewer(roomId)
                .stream().map(ReviewResponse::from).toList();
    }

    @Transactional
    public ReviewResponse createReview(ReviewRequest req, Integer userId) {
        Room room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        if (reviewRepository.existsByRoomIdAndUserId(req.getRoomId(), userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already reviewed this room");
        }

        Review review = Review.builder()
                .roomId(req.getRoomId())
                .userId(userId)
                .rating(req.getRating())
                .comment(req.getComment())
                .build();

        Review saved = reviewRepository.save(review);

        Double avg = reviewRepository.avgRatingByRoomId(req.getRoomId());
        long count = reviewRepository.countByRoomId(req.getRoomId());
        room.setAvgRating(avg != null ? Math.round(avg * 10.0) / 10.0 : null);
        room.setReviewCount((int) count);
        roomRepository.save(room);

        saved = reviewRepository.findByRoomIdWithReviewer(req.getRoomId())
                .stream().filter(r -> r.getId().equals(saved.getId())).findFirst().orElse(saved);

        return ReviewResponse.from(saved);
    }
}
