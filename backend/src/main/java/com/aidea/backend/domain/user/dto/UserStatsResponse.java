package com.aidea.backend.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 사용자 통계 정보 응답 DTO
 */
@Getter
@Builder
public class UserStatsResponse {

    private Integer groupCount;
    private Integer eventCount;
    private Double attendanceRate;
    private Integer activityScore;
    private Integer reviewCount;
}