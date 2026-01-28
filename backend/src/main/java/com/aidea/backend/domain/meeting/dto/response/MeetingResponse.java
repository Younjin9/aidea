package com.aidea.backend.domain.meeting.dto.response;

import com.aidea.backend.domain.meeting.entity.enums.MeetingStatus;
import com.aidea.backend.domain.meeting.entity.enums.Region;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 모임 상세 응답 DTO
 */
@Getter
@Builder
public class MeetingResponse {

    private Long groupId; // meetingId -> groupId (Spec unified)
    private String title;
    private String description;
    private String imageUrl;
    private String interestCategoryId; // category -> interestCategoryId (Spec unified)
    private String interestCategoryName; // categoryDisplayName -> interestCategoryName
    private Region region;
    private String regionFullName;
    private String location;
    private Double latitude;
    private Double longitude;
    private String locationDetail;
    private Integer maxMembers;
    private Integer currentMembers;
    private LocalDateTime meetingDate;
    private MeetingStatus status;
    private Boolean isPublic; // Added isPublic
    private CreatorDto creator;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
