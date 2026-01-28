package com.aidea.backend.domain.meeting.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * 모임 찜 상태 응답 DTO
 */
@Getter
@Builder
public class MeetingLikeResponse {

    private Boolean isLiked;
    private Long likeCount;
    private String message;
}