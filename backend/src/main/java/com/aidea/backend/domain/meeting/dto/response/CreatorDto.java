package com.aidea.backend.domain.meeting.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * 생성자 정보 DTO
 */
@Getter
@Builder
public class CreatorDto {

    private Long userId;
    private String nickname;
    private String profileImage;
}
