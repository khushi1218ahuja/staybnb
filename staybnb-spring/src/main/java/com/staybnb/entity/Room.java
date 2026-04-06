package com.staybnb.entity;

import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "host_id", nullable = false)
    private Integer hostId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "room_type")
    @Enumerated(EnumType.STRING)
    private RoomType type;

    @Column(name = "price_per_night", nullable = false)
    private Double pricePerNight;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String city;

    @Type(StringArrayType.class)
    @Column(name = "amenities", columnDefinition = "text[]")
    @Builder.Default
    private String[] amenities = new String[0];

    @Type(StringArrayType.class)
    @Column(name = "images", columnDefinition = "text[]")
    @Builder.Default
    private String[] images = new String[0];

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @Column(name = "avg_rating")
    private Double avgRating;

    @Column(name = "review_count", nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", insertable = false, updatable = false)
    private User host;

    public enum RoomType {
        ENTIRE, PRIVATE, SHARED
    }
}
