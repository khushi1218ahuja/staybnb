package com.staybnb.dto;

import com.staybnb.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserDto {
    private Integer id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String address;
    private String profilePicture;
    private Boolean isVerified;
    private LocalDateTime createdAt;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .address(user.getAddress())
                .profilePicture(user.getProfilePicture())
                .isVerified(user.getIsVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
