package com.aidea.backend.domain.recommendation.service;

import com.aidea.backend.domain.interest.entity.Interest;
import com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse;
import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.entity.enums.MeetingStatus;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.recommendation.dto.MeetingRecommendationDto;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.entity.UserInterest;
import com.aidea.backend.domain.user.repository.UserInterestRepository;
import com.aidea.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 모임 추천 서비스
 * 규칙 기반(Rule-Based) 추천 로직을 제공합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

  private final UserRepository userRepository;
  private final MeetingRepository meetingRepository;
  private final UserInterestRepository userInterestRepository;

  // 가중치 상수
  private static final double INTEREST_WEIGHT = 40.0;
  private static final double LOCATION_WEIGHT = 30.0;
  private static final double POPULARITY_WEIGHT = 20.0;
  private static final double FRESHNESS_WEIGHT = 10.0;

  // 최소 추천 점수
  private static final double MIN_SCORE_THRESHOLD = 20.0;

  /**
   * 사용자에게 추천할 모임 목록을 반환합니다.
   * 
   * @param email 사용자 이메일
   * @param limit 반환할 최대 개수
   * @return 추천 모임 목록
   */
  public List<MeetingSummaryResponse> getRecommendedMeetings(String email, int limit) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + email));

    // 모집 중인 모임만 조회
    List<Meeting> allMeetings = meetingRepository.findAll().stream()
        .filter(meeting -> meeting.getStatus() == MeetingStatus.RECRUITING)
        .filter(meeting -> !meeting.isFull())
        .collect(Collectors.toList());

    if (allMeetings.isEmpty()) {
      log.info("추천 가능한 모임이 없습니다.");
      return Collections.emptyList();
    }

    // 각 모임에 대해 점수 계산
    List<MeetingRecommendationDto> recommendations = allMeetings.stream()
        .map(meeting -> {
          double score = calculateScore(user, meeting);
          String reason = buildRecommendationReason(user, meeting);
          return MeetingRecommendationDto.builder()
              .meeting(meeting)
              .score(score)
              .reason(reason)
              .build();
        })
        .filter(dto -> dto.getScore() >= MIN_SCORE_THRESHOLD)
        .sorted() // Comparable 구현에 의해 점수 높은 순 정렬
        .limit(limit)
        .collect(Collectors.toList());

    log.info("사용자 {}에게 {} 개의 모임을 추천합니다.", email, recommendations.size());

    return recommendations.stream()
        .map(dto -> dto.getMeeting().toSummary())
        .collect(Collectors.toList());
  }

  /**
   * 개별 모임에 대한 총 추천 점수를 계산합니다.
   */
  private double calculateScore(User user, Meeting meeting) {
    double interestScore = calculateInterestScore(user, meeting);
    double locationScore = calculateLocationScore(user, meeting);
    double popularityScore = calculatePopularityScore(meeting);
    double freshnessScore = calculateFreshnessScore(meeting);

    return interestScore + locationScore + popularityScore + freshnessScore;
  }

  /**
   * 관심사 매칭 점수 (최대 40점)
   */
  private double calculateInterestScore(User user, Meeting meeting) {
    List<UserInterest> userInterests = userInterestRepository.findAll().stream()
        .filter(ui -> ui.getUser().getUserId().equals(user.getUserId()))
        .collect(Collectors.toList());

    if (userInterests.isEmpty()) {
      return 0.0;
    }

    double maxScore = 0.0;

    for (UserInterest userInterest : userInterests) {
      Interest interest = userInterest.getInterest();
      double score = 0.0;

      // 1. 카테고리 완전 일치 (40점)
      if (interest.getCategory() != null &&
          interest.getCategory().equalsIgnoreCase(meeting.getCategory().name())) {
        score = INTEREST_WEIGHT;
      }
      // 2. 제목 또는 설명에 관심사 이름 포함 (20점)
      else if (meeting.getTitle().contains(interest.getInterestName()) ||
          (meeting.getDescription() != null && meeting.getDescription().contains(interest.getInterestName()))) {
        score = INTEREST_WEIGHT / 2.0;
      }

      maxScore = Math.max(maxScore, score);
    }

    return maxScore;
  }

  /**
   * 지역 근접도 점수 (최대 30점)
   */
  private double calculateLocationScore(User user, Meeting meeting) {
    if (user.getLocation() == null || meeting.getRegion() == null) {
      return 0.0;
    }

    // 사용자 위치에서 Region 추출 (간단한 문자열 매칭)
    String userLocation = user.getLocation().toUpperCase();
    String meetingRegion = meeting.getRegion().name();

    // 완전 일치 (30점)
    if (userLocation.contains(meetingRegion.replace("_", " "))) {
      return LOCATION_WEIGHT;
    }

    // 서울 내 다른 구 (15점)
    if (userLocation.contains("SEOUL") && meetingRegion.startsWith("SEOUL")) {
      return LOCATION_WEIGHT / 2.0;
    }

    return 0.0;
  }

  /**
   * 인기도 점수 (최대 20점)
   */
  private double calculatePopularityScore(Meeting meeting) {
    if (meeting.getMaxMembers() == 0) {
      return 0.0;
    }

    double ratio = (double) meeting.getCurrentMembers() / meeting.getMaxMembers();
    return ratio * POPULARITY_WEIGHT;
  }

  /**
   * 신선도 점수 (최대 10점)
   */
  private double calculateFreshnessScore(Meeting meeting) {
    if (meeting.getCreatedAt() == null) {
      return 0.0;
    }

    long daysSinceCreation = ChronoUnit.DAYS.between(meeting.getCreatedAt(), LocalDateTime.now());
    double score = Math.max(0, FRESHNESS_WEIGHT - daysSinceCreation);

    return score;
  }

  /**
   * 추천 이유를 생성합니다 (디버깅용)
   */
  private String buildRecommendationReason(User user, Meeting meeting) {
    StringBuilder reason = new StringBuilder();

    double interestScore = calculateInterestScore(user, meeting);
    if (interestScore > 0) {
      reason.append("관심사 일치(").append(String.format("%.1f", interestScore)).append("점) ");
    }

    double locationScore = calculateLocationScore(user, meeting);
    if (locationScore > 0) {
      reason.append("지역 근접(").append(String.format("%.1f", locationScore)).append("점) ");
    }

    double popularityScore = calculatePopularityScore(meeting);
    if (popularityScore > 0) {
      reason.append("인기도(").append(String.format("%.1f", popularityScore)).append("점) ");
    }

    double freshnessScore = calculateFreshnessScore(meeting);
    if (freshnessScore > 0) {
      reason.append("신규(").append(String.format("%.1f", freshnessScore)).append("점)");
    }

    return reason.toString().trim();
  }
}
