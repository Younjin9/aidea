package com.aidea.backend.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long userId;
    private String email;
    private String nickname;
    private String phoneNumber;
    private LocalDate birthDate;
    private String gender;
    private String profileImage;
    private String location;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
}
