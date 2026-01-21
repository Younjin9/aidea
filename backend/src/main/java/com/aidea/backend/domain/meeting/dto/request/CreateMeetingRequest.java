package com.aidea.backend.domain.meeting.dto.request;

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

    @NotBlank(message = "위치는 필수입니다")
    private String location;

    @NotNull(message = "위도는 필수입니다")
    private Double latitude;

    @NotNull(message = "경도는 필수입니다")
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
