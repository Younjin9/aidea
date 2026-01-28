package com.aidea.backend.domain.meeting.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 찜한 모임 응답 DTO
 */
@Getter
@Builder
public class LikedMeetingResponse {

    private Long meetingLikeId;
    private MeetingResponse meeting;
    private LocalDateTime likedAt;
}