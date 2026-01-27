package com.aidea.backend.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String userId; // Frontend expects string
    private String email;
    private String nickname;
    private String phoneNumber;
    private LocalDate birthDate;
    private String gender;
    private String profileImage;
    private Location location;
    private String provider; // Frontend expects Provider enum string
    private List<String> interests; // Frontend expects string[]
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        private Double lat;
        private Double lng;
        private String region;
    }
}
