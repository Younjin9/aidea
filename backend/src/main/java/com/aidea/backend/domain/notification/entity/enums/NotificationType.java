package com.aidea.backend.domain.notification.entity.enums;

/**
 * 알림 타입 Enum
 */
public enum NotificationType {
    LIKE,              // 좋아요
    JOIN_REQUEST,      // 참가 신청
    JOIN_APPROVED,     // 참가 승인
    JOIN_REJECTED,     // 참가 거절
    EVENT_JOIN,        // 정모 참가
    EVENT_CANCEL,      // 정모 취소
    MEMBER_LEFT,       // 멤버 탈퇴
    HOST_TRANSFERRED,  // 모임장 양도
    CHAT_MESSAGE       // 채팅 메시지
}