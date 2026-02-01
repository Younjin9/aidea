package com.aidea.backend.domain.meeting.dto.response;

import com.aidea.backend.domain.meeting.entity.enums.MemberStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 참가 신청 정보 응답 DTO (HOST용)
 */
@Getter
@Builder
public class JoinRequestResponse {
    private Long memberId; // MeetingMember ID
    private Long userId; // User ID
    private String nickname; // 닉네임
    private String profileImage; // 프로필 이미지
    private MemberStatus status; // 상태 (주로 PENDING)
    private LocalDateTime requestedAt; // 신청 시간
    private String requestMessage; // 가입 인사
}
