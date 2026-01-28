package com.aidea.backend.domain.meeting.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.AllArgsConstructor;

/**
 * 생성자 정보 DTO
 */
@Getter
@Builder
@AllArgsConstructor
public class CreatorDto {

    private Long userId;
    private String nickname;
    private String profileImage;
}
