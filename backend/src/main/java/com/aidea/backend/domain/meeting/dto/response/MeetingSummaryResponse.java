package com.aidea.backend.domain.meeting.dto.response;

import com.aidea.backend.domain.meeting.entity.enums.MeetingCategory;
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

    private Long meetingId;
    private String title;
    private String imageUrl;
    private MeetingCategory category;
    private String categoryDisplayName;
    private Region region;
    private String regionFullName;
    private String location;
    private LocalDateTime meetingDate;
    private Integer currentMembers;
    private Integer maxMembers;
    private MeetingStatus status;
}
