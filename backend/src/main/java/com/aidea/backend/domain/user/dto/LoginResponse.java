package com.aidea.backend.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private UserInfo user;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String email;
        private String nickname;
        private String phoneNumber;
        private String gender;
    }
}
