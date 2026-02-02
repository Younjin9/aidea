package com.aidea.backend.domain.event.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@ToString
public class CreateEventRequest {

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    @NotNull(message = "일시는 필수입니다.")
    private LocalDateTime scheduledAt;

    @NotBlank(message = "장소명은 필수입니다.")
    private String placeName;

    @NotNull(message = "위치 정보는 필수입니다.")
    private LocationDto location;

    @NotNull(message = "최대 인원은 필수입니다.")
    private Integer maxParticipants;

    private String cost;
    private String notes;
    private String imageUrl;

    @Getter
    @NoArgsConstructor
    public static class LocationDto {
        private Double lat;
        private Double lng;
    }
}
