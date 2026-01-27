package com.aidea.backend.domain.meeting.dto.request;

import com.aidea.backend.domain.meeting.entity.enums.MeetingCategory;
import com.aidea.backend.domain.meeting.entity.enums.Region;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 모임 수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMeetingRequest {

    @NotBlank(message = "모임 제목은 필수입니다")
    @Size(max = 100, message = "제목은 100자 이하여야 합니다")
    private String title;

    @Size(max = 1000, message = "설명은 1000자 이하여야 합니다")
    private String description;

    private String imageUrl;

    private MeetingCategory category;

    private Region region;

    @NotBlank(message = "위치는 필수입니다")
    private String location;

    @NotNull(message = "위도는 필수입니다")
    private Double latitude;

    @NotNull(message = "경도는 필수입니다")
    private Double longitude;

    private String locationDetail;

    @Min(value = 2, message = "최소 인원은 2명 이상이어야 합니다")
    @Max(value = 100, message = "최대 인원은 100명 이하여야 합니다")
    private Integer maxMembers;

    @NotNull(message = "모임 일시는 필수입니다")
    @Future(message = "모임 일시는 미래여야 합니다")
    private LocalDateTime meetingDate;

    @NotNull(message = "승인 필요 여부는 필수입니다")
    private Boolean isApprovalRequired;
}
