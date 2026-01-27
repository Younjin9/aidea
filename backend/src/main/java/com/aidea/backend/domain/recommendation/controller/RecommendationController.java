package com.aidea.backend.domain.recommendation.controller;

import com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse;
import com.aidea.backend.domain.recommendation.dto.RecommendedMeetingResponse;
import com.aidea.backend.domain.recommendation.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 모임 추천 API 컨트롤러
 */
@Tag(name = "Recommendation", description = "모임 추천 API")
@Slf4j
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @Operation(summary = "추천 모임 조회", description = "로그인한 사용자의 정보를 기반으로 추천 모임 목록을 반환합니다.")
    @GetMapping("/meetings")
    public ResponseEntity<List<MeetingSummaryResponse>> getRecommendedMeetings(
            Authentication authentication,
            @Parameter(description = "반환할 최대 개수", example = "10")
            @RequestParam(defaultValue = "10") int limit
    ) {
        String email = authentication.getName();
        log.info("추천 모임 조회 요청: email={}, limit={}", email, limit);

        List<MeetingSummaryResponse> recommendations =
                recommendationService.getRecommendedMeetings(email, limit);

        return ResponseEntity.ok(recommendations);
    }

    // ✅ (선택) 너가 만든 MVP 유지: 테스트/데모용 nickname 기반 추천
    // 운영에서는 쓰지 않을 거면 나중에 제거해도 됨.
    @Operation(summary = "추천 모임 조회(테스트)", description = "nickname 기반 추천(테스트/데모용)")
    @GetMapping("/meetings/by-nickname")
    public ResponseEntity<List<RecommendedMeetingResponse>> recommendMeetingsByNickname(
            @RequestParam String nickname,
            @RequestParam(defaultValue = "10") int topK,
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<RecommendedMeetingResponse> result =
                recommendationService.recommendMeetingsByNickname(nickname, topK, limit);
        return ResponseEntity.ok(result);
    }
}