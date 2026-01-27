package com.aidea.backend.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TokenRefreshResponse {
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private UserResponse user;
}
