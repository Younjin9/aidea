package com.aidea.backend.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 알림 설정 수정 요청 DTO
 */
@Getter
@Builder
public class NotificationSettingsRequest {

    private Boolean chatEnabled;
    private Boolean eventEnabled;
    private Boolean marketingEnabled;
}