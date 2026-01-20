package com.aidea.backend.domain.meeting.entity.enums;

/**
 * 모임 멤버 상태
 */
public enum MemberStatus {
    PENDING, // 승인 대기
    APPROVED, // 승인됨
    REJECTED, // 거절됨
    LEFT // 나감
}
