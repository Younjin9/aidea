package com.aidea.backend.domain.meeting.dto.request;

import com.aidea.backend.domain.meeting.entity.enums.MeetingCategory;
import com.aidea.backend.domain.meeting.entity.enums.Region;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 모임 생성 요청 DTO
 */
@Getter
@NoArgsConstructor
public class CreateMeetingRequest {

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    private String description;

    private String imageUrl;

    @NotNull(message = "카테고리는 필수입니다")
    private MeetingCategory category;

    @NotNull(message = "지역은 필수입니다")
    private Region region;

    // 정모 상세 위치 (선택)
    private String location;

    private Double latitude;

    private Double longitude;

    private String locationDetail;

    @NotNull(message = "최대 인원은 필수입니다")
    @Min(value = 2, message = "최소 2명 이상이어야 합니다")
    private Integer maxMembers;

    @NotNull(message = "모임 날짜는 필수입니다")
    @Future(message = "과거 날짜는 선택할 수 없습니다")
    private LocalDateTime meetingDate;

    private Boolean isApprovalRequired;
}
