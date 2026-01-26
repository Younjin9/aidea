package com.aidea.backend.domain.recommendation.controller;

import com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse;
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

  /**
   * 로그인한 사용자에게 추천 모임 목록을 반환합니다.
   * 
   * @param authentication 인증 정보
   * @param limit          반환할 최대 개수 (기본값: 10)
   * @return 추천 모임 목록
   */
  @Operation(summary = "추천 모임 조회", description = "사용자의 관심사, 위치, 모임 인기도 등을 고려하여 추천 모임 목록을 반환합니다.")
  @GetMapping("/meetings")
  public ResponseEntity<List<MeetingSummaryResponse>> getRecommendedMeetings(
      Authentication authentication,
      @Parameter(description = "반환할 최대 개수", example = "10") @RequestParam(defaultValue = "10") int limit) {

    String email = authentication.getName();
    log.info("추천 모임 조회 요청: email={}, limit={}", email, limit);

    List<MeetingSummaryResponse> recommendations = recommendationService.getRecommendedMeetings(email, limit);

    return ResponseEntity.ok(recommendations);
  }
}
