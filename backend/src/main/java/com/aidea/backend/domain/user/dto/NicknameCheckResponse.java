package com.aidea.backend.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NicknameCheckResponse {
    private boolean available;  // true: 사용 가능, false: 중복
    private String message;
}