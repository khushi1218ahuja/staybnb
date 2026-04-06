package com.staybnb.dto;

import com.staybnb.entity.Review;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Integer id;
    private Integer roomId;
    private Integer userId;
    private String reviewerName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public static ReviewResponse from(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .roomId(r.getRoomId())
                .userId(r.getUserId())
                .reviewerName(r.getReviewer() != null ? r.getReviewer().getName() : null)
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
