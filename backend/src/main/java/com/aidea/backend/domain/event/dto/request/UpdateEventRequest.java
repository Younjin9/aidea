package com.aidea.backend.domain.event.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@ToString
public class UpdateEventRequest {

    private String title;
    private LocalDateTime scheduledAt;
    private String placeName;
    private LocationDto location;
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
