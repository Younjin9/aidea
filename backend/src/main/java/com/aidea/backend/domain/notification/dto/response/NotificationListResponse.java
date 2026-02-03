package com.aidea.backend.domain.notification.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 알림 목록 응답 DTO
 */
@Getter
@Builder
public class NotificationListResponse {

    private List<NotificationResponse> notifications;
    private Integer totalCount;
    private Integer unreadCount;
}