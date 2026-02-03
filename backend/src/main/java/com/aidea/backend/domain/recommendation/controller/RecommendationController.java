package com.aidea.backend.domain.recommendation.controller;

import com.aidea.backend.domain.recommendation.dto.RecommendedMeetingCardResponse;
import com.aidea.backend.domain.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * ✅ 정식 구조
     * - nickname 파라미터 제거
     * - JWT 인증 principal(email) 기반으로 추천
     *
     * 호출 예시:
     * GET /api/recommendations?topK=10&limit=10&mode=vector
     * Authorization: Bearer {JWT}
     */
    @GetMapping
    public List<RecommendedMeetingCardResponse> recommend(
            @AuthenticationPrincipal String email,
            @RequestParam(defaultValue = "10") int topK,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "vector") String mode
    ) {
        return recommendationService.recommendMeetingsByEmail(email, topK, limit, mode);
    }

    /**
     * Shorts 스타일 추천 UI를 위한 엔드포인트
     */
    @GetMapping("/shorts")
    public List<RecommendedMeetingCardResponse> recommendShorts(
            @AuthenticationPrincipal String email,
            @RequestParam(defaultValue = "10") int topK,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "vector") String mode
    ) {
        return recommendationService.recommendMeetingsByEmail(email, topK, limit, mode);
    }
}