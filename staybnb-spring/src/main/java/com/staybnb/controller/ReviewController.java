package com.staybnb.controller;

import com.staybnb.dto.ReviewRequest;
import com.staybnb.dto.ReviewResponse;
import com.staybnb.security.AuthenticatedUser;
import com.staybnb.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ReviewResponse>> getRoomReviews(@PathVariable Integer roomId) {
        return ResponseEntity.ok(reviewService.getRoomReviews(roomId));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> create(
            @Valid @RequestBody ReviewRequest req,
            @AuthenticationPrincipal AuthenticatedUser auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(req, auth.getId()));
    }
}
