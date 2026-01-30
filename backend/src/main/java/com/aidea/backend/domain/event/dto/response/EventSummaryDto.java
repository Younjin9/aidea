package com.aidea.backend.domain.event.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 모임 상세에서 사용할 이벤트 요약 DTO
 */
@Getter
@Builder
public class EventSummaryDto {
    private Long eventId;
    private String title;
    private LocalDateTime scheduledAt;
    private String date; // "2024-01-22" 형식 (프론트엔드 호환)
    private String placeName;
    private Integer cost;
    private Integer maxParticipants;
    private Integer participantCount;
    private List<ParticipantDto> participants;

    @Getter
    @AllArgsConstructor
    public static class ParticipantDto {
        private Long userId;
        private String nickname;
        private String profileImage;
        private String role; // HOST, MEMBER
        private String status; // APPROVED, PENDING, REJECTED
        private LocalDateTime joinedAt;
    }
}
