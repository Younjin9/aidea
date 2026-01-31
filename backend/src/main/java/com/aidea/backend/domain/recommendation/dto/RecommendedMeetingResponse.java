package com.aidea.backend.domain.recommendation.dto;

public record RecommendedMeetingResponse(
        Long meetingId,
        Double score
) {}