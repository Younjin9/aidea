package com.aidea.backend.domain.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RecommendedMeetingCardResponse {
    private Long meetingId;
    private String title;
    private String category;   // enum이면 String으로 내려도 됨
    private String region;     // enum이면 String으로 내려도 됨
    private int currentMembers;
    private int maxMembers;

    private double score;
    private String reason;     // 추천 사유

}