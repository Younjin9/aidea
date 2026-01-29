package com.aidea.backend.domain.meeting.dto.response;

import com.aidea.backend.domain.meeting.entity.enums.MeetingStatus;
import com.aidea.backend.domain.meeting.entity.enums.Region;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 모임 목록 응답 DTO (간단 버전)
 */
@Getter
@Builder
public class MeetingSummaryResponse {

    private Long groupId; // meetingId -> groupId
    private String title;
    private String imageUrl;
    private String interestCategoryId; // category -> interestCategoryId
    private String interestCategoryName; // categoryDisplayName -> interestCategoryName
    private Region region;
    private String regionFullName;
    private String location;
    private LocalDateTime meetingDate;
    private Integer currentMembers;
    private Integer maxMembers;
    private MeetingStatus status;

    // 사용자 권한 정보 (조회 시점 기준)
    private String myRole; // HOST, MEMBER, NONE
    private String myStatus; // APPROVED, PENDING, REJECTED, NONE
}
