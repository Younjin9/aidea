package com.aidea.backend.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 알림 설정 응답 DTO
 */
@Getter
@Builder
public class NotificationSettingsResponse {

    private Boolean chatEnabled;
    private Boolean eventEnabled;
    private Boolean marketingEnabled;
}