package com.aidea.backend.domain.notification.dto.response;

import com.aidea.backend.domain.notification.entity.enums.NotificationType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 알림 응답 DTO
 */
@Getter
@Builder
public class NotificationResponse {

    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private Long relatedGroupId;
    private Long relatedUserId;
    private Long relatedEventId;
}