package com.staybnb.repository;

import com.staybnb.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {

    List<Room> findByHostId(Integer hostId);

    long countByIsAvailable(boolean isAvailable);

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.host h WHERE " +
           "(:city IS NULL OR LOWER(r.city) = LOWER(:city)) AND " +
           "(:minPrice IS NULL OR r.pricePerNight >= :minPrice) AND " +
           "(:maxPrice IS NULL OR r.pricePerNight <= :maxPrice) AND " +
           "(:type IS NULL OR CAST(r.type AS string) = :type) AND " +
           "(:search IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(r.city) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(r.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Room> searchRooms(
            @Param("city") String city,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("type") String type,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.host WHERE r.isAvailable = true ORDER BY r.avgRating DESC NULLS LAST, r.reviewCount DESC")
    List<Room> findFeaturedRooms(Pageable pageable);

    @Query("SELECT DISTINCT r.city FROM Room r WHERE r.isAvailable = true ORDER BY r.city")
    List<String> findDistinctCities();
}
