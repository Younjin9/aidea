package com.aidea.backend.domain.recommendation.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aidea.backend.domain.recommendation.dto.RecommendedMeetingResponse;
import com.aidea.backend.domain.recommendation.service.RecommendationService;

@RestController
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/api/recommendations/meetings")
    public List<RecommendedMeetingResponse> recommendMeetings(
            @RequestParam String nickname,
            @RequestParam(defaultValue = "10") int topK,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return recommendationService.recommendMeetingsByNickname(nickname, topK, limit);
    }
}