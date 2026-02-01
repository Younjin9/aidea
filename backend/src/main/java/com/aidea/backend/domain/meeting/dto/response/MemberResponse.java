package com.aidea.backend.domain.meeting.dto.response;

import com.aidea.backend.domain.meeting.entity.enums.MemberRole;
import com.aidea.backend.domain.meeting.entity.enums.MemberStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 참가자 정보 응답 DTO
 */
@Getter
@Builder
public class MemberResponse {
    private Long memberId; // MeetingMember ID
    private Long userId; // User ID
    private String nickname; // 닉네임
    private String profileImage; // 프로필 이미지
    private MemberRole role; // 역할 (HOST/MEMBER)
    private MemberStatus status; // 상태 (PENDING/APPROVED/REJECTED/LEFT)
    private LocalDateTime joinedAt; // 참여 시간
    private String requestMessage; // 가입 인사
}
