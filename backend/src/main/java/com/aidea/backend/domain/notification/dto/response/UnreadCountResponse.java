package com.aidea.backend.domain.notification.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * 안 읽은 알림 개수 응답 DTO
 */
@Getter
@Builder
public class UnreadCountResponse {

    private Integer unreadCount;
}