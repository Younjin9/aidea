package com.aidea.backend.domain.event.dto.response;

import com.aidea.backend.domain.event.entity.Event;
import lombok.Builder;
import lombok.Getter;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class EventDetailResponse { // Maps to Frontend 'EventDetail'

    private Long eventId;
    private Long groupId;
    private String title;
    private LocalDateTime scheduledAt;
    private String placeName;
    private LocationDto location;
    private Integer participantCount;
    private Integer maxParticipants;
    private String notes;
    private String cost;
    private LocalDateTime createdAt;

    // Extra fields expected by frontend
    private List<ParticipantDto> participants; // Fix type from Object to ParticipantDto
    private boolean isParticipating;

    @Getter
    @Builder
    public static class LocationDto {
        private Double lat;
        private Double lng;
    }

    public static EventDetailResponse from(Event event, Long currentUserId) {
        boolean isParticipating = false;
        // Calculate isParticipating if currentUserId is provided
        if (currentUserId != null) {
            isParticipating = event.getParticipants().stream()
                    .anyMatch(p -> p.getUser().getUserId().equals(currentUserId));
        }

        // Map participants (simple version for now, max 3-5 or full?)
        // Frontend likely needs list to show profile images.
        // Convert Entity participants to DTOs or simple objects?
        // For now, let's map essential fields if needed, or stick to simple count +
        // check.
        // Frontend 'EventCard' uses `event.participants`.

        List<ParticipantDto> participantList = event.getParticipants().stream()
                .map(p -> new ParticipantDto(
                        p.getUser().getUserId(),
                        p.getUser().getNickname(),
                        p.getUser().getProfileImage()))
                .collect(Collectors.toList());

        return EventDetailResponse.builder()
                .eventId(event.getId())
                .groupId(event.getMeeting().getId())
                .title(event.getTitle())
                .scheduledAt(event.getDate())
                .placeName(event.getLocationName())
                .location(LocationDto.builder()
                        .lat(event.getLatitude())
                        .lng(event.getLongitude())
                        .build())
                .participantCount(event.getParticipants().size()) // Use actual size
                .maxParticipants(event.getMaxParticipants())
                .notes(event.getDescription())
                .cost(event.getCost())
                .createdAt(event.getCreatedAt())
                .participants(participantList)
                .isParticipating(isParticipating)
                .build();
    }

    @Getter
    @AllArgsConstructor
    public static class ParticipantDto {
        private Long userId;
        private String nickname;
        private String profileImage;
        // role?
    }
}
