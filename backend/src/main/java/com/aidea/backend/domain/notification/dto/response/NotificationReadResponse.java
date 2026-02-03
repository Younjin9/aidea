package com.aidea.backend.domain.notification.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * 알림 읽음 처리 응답 DTO
 */
@Getter
@Builder
public class NotificationReadResponse {

    private Boolean success;
    private String message;
}