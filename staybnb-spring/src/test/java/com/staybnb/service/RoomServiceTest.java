package com.staybnb.service;

import com.staybnb.dto.RoomRequest;
import com.staybnb.dto.RoomResponse;
import com.staybnb.entity.Room;
import com.staybnb.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private RoomService roomService;

    private Room testRoom;

    @BeforeEach
    void setUp() {
        testRoom = Room.builder()
                .id(1)
                .hostId(10)
                .title("Sea View Suite")
                .description("Beautiful suite")
                .type(Room.RoomType.ENTIRE)
                .pricePerNight(5000.0)
                .location("Marine Drive")
                .city("Mumbai")
                .amenities(new String[]{"WiFi", "AC"})
                .images(new String[]{"img1.jpg"})
                .isAvailable(true)
                .reviewCount(0)
                .build();
    }

    @Test
    void getById_found() {
        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));

        RoomResponse response = roomService.getById(1);

        assertThat(response.getId()).isEqualTo(1);
        assertThat(response.getTitle()).isEqualTo("Sea View Suite");
        assertThat(response.getCity()).isEqualTo("Mumbai");
    }

    @Test
    void getById_notFound_throws() {
        when(roomRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.getById(99))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Room not found");
    }

    @Test
    void create_success() {
        RoomRequest req = new RoomRequest();
        req.setTitle("New Room");
        req.setDescription("A room");
        req.setType("ENTIRE");
        req.setPricePerNight(3000.0);
        req.setLocation("Andheri");
        req.setCity("Mumbai");
        req.setAmenities(List.of("WiFi"));
        req.setImages(List.of("img.jpg"));

        when(roomRepository.save(any(Room.class))).thenReturn(testRoom);

        RoomResponse response = roomService.create(req, 10);
        assertThat(response).isNotNull();
        verify(roomRepository).save(any(Room.class));
    }

    @Test
    void delete_byOwner_succeeds() {
        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));

        roomService.delete(1, 10, "HOST");

        verify(roomRepository).delete(testRoom);
    }

    @Test
    void delete_byDifferentHost_throws() {
        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));

        assertThatThrownBy(() -> roomService.delete(1, 99, "HOST"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Access denied");
    }

    @Test
    void delete_byAdmin_succeeds() {
        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));

        roomService.delete(1, 999, "ADMIN");

        verify(roomRepository).delete(testRoom);
    }

    @Test
    void getHostRooms_returnsList() {
        when(roomRepository.findByHostId(10)).thenReturn(List.of(testRoom));

        List<RoomResponse> results = roomService.getHostRooms(10);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getHostId()).isEqualTo(10);
    }
}
