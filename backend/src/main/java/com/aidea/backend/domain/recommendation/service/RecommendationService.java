package com.aidea.backend.domain.recommendation.service;

import com.aidea.backend.domain.interest.entity.Interest;
import com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse;
import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.entity.enums.MeetingStatus;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.recommendation.dto.MeetingRecommendationDto;
import com.aidea.backend.domain.recommendation.dto.RecommendedMeetingResponse;
import com.aidea.backend.domain.recommendation.repository.HobbyVectorRepository;
import com.aidea.backend.domain.recommendation.repository.MySqlRecommendationRepository;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 모임 추천 서비스
 * - develop: 규칙 기반(Rule-Based) 추천
 * - mingyu: MVP(취미 벡터 TOP-K 기반) 추천
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    // ✅ develop 쪽 의존성
    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;
    private final UserInterestRepository userInterestRepository;

    // ✅ mingyu(MVP) 쪽 의존성 (브랜치에 이미 repo가 있다면 컴파일 OK)
    private final MySqlRecommendationRepository mySqlRepo;
    private final HobbyVectorRepository hobbyVectorRepo;

    // 가중치 상수 (develop)
    private static final double INTEREST_WEIGHT = 40.0;
    private static final double LOCATION_WEIGHT = 30.0;
    private static final double POPULARITY_WEIGHT = 20.0;
    private static final double FRESHNESS_WEIGHT = 10.0;
    private static final double MIN_SCORE_THRESHOLD = 20.0;

    /**
     * ✅ develop: 로그인 유저(email) 기반 추천 모임 목록 반환
     */
    public List<MeetingSummaryResponse> getRecommendedMeetings(String email, int limit) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + email));

        List<Meeting> allMeetings = meetingRepository.findAll().stream()
                .filter(meeting -> meeting.getStatus() == MeetingStatus.RECRUITING)
                .filter(meeting -> !meeting.isFull())
                .collect(Collectors.toList());

        if (allMeetings.isEmpty()) {
            log.info("추천 가능한 모임이 없습니다.");
            return Collections.emptyList();
        }

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
                .sorted()
                .limit(limit)
                .collect(Collectors.toList());

        log.info("사용자 {}에게 {} 개의 모임을 추천합니다.", email, recommendations.size());

        return recommendations.stream()
                .map(dto -> dto.getMeeting().toSummary())
                .collect(Collectors.toList());
    }

    /**
     * ✅ mingyu: nickname 기반 추천 (테스트/데모용 MVP)
     * - Postgres(벡터): 유저 취미 평균 벡터 기준 TOP-K 취미 추출
     * - MySQL: TOP-K 취미에 연결된 모임 조회
     */
    @Transactional(readOnly = true)
    public List<RecommendedMeetingResponse> recommendMeetingsByNickname(String nickname, int topK, int limit) {
        Long userId = mySqlRepo.findUserIdByNickname(nickname);
        List<Long> selectedHobbyIds = mySqlRepo.findSelectedHobbyIdsByUserId(userId);

        if (selectedHobbyIds == null || selectedHobbyIds.isEmpty()) {
            return List.of();
        }

        List<Map<String, Object>> topHobbies =
                hobbyVectorRepo.findTopHobbiesByUserVector(selectedHobbyIds, topK);

        List<Long> candidateHobbyIds = new ArrayList<>();
        for (Map<String, Object> row : topHobbies) {
            candidateHobbyIds.add(((Number) row.get("hobby_id")).longValue());
        }

        if (candidateHobbyIds.isEmpty()) return List.of();

        List<Long> meetingIds = mySqlRepo.findMeetingIdsByHobbyIds(candidateHobbyIds);

        return meetingIds.stream()
                .distinct()
                .limit(limit)
                .map(id -> new RecommendedMeetingResponse(id, 0.0))
                .toList();
    }

    // ---------- develop 내부 점수 계산 로직 ----------

    private double calculateScore(User user, Meeting meeting) {
        double interestScore = calculateInterestScore(user, meeting);
        double locationScore = calculateLocationScore(user, meeting);
        double popularityScore = calculatePopularityScore(meeting);
        double freshnessScore = calculateFreshnessScore(meeting);
        return interestScore + locationScore + popularityScore + freshnessScore;
    }

    private double calculateInterestScore(User user, Meeting meeting) {
        List<UserInterest> userInterests = userInterestRepository.findAll().stream()
                .filter(ui -> ui.getUser().getUserId().equals(user.getUserId()))
                .collect(Collectors.toList());

        if (userInterests.isEmpty()) return 0.0;

        double maxScore = 0.0;

        for (UserInterest userInterest : userInterests) {
            Interest interest = userInterest.getInterest();
            double score = 0.0;

            if (interest.getCategory() != null &&
                    interest.getCategory().equalsIgnoreCase(meeting.getCategory().name())) {
                score = INTEREST_WEIGHT;
            } else if (meeting.getTitle().contains(interest.getInterestName()) ||
                    (meeting.getDescription() != null && meeting.getDescription().contains(interest.getInterestName()))) {
                score = INTEREST_WEIGHT / 2.0;
            }

            maxScore = Math.max(maxScore, score);
        }

        return maxScore;
    }

    private double calculateLocationScore(User user, Meeting meeting) {
        if (user.getLocation() == null || meeting.getRegion() == null) return 0.0;

        String userLocation = user.getLocation().toUpperCase();
        String meetingRegion = meeting.getRegion().name();

        if (userLocation.contains(meetingRegion.replace("_", " "))) return LOCATION_WEIGHT;
        if (userLocation.contains("SEOUL") && meetingRegion.startsWith("SEOUL")) return LOCATION_WEIGHT / 2.0;

        return 0.0;
    }

    private double calculatePopularityScore(Meeting meeting) {
        if (meeting.getMaxMembers() == 0) return 0.0;
        double ratio = (double) meeting.getCurrentMembers() / meeting.getMaxMembers();
        return ratio * POPULARITY_WEIGHT;
    }

    private double calculateFreshnessScore(Meeting meeting) {
        if (meeting.getCreatedAt() == null) return 0.0;
        long daysSinceCreation = ChronoUnit.DAYS.between(meeting.getCreatedAt(), LocalDateTime.now());
        return Math.max(0, FRESHNESS_WEIGHT - daysSinceCreation);
    }

    private String buildRecommendationReason(User user, Meeting meeting) {
        StringBuilder reason = new StringBuilder();

        double interestScore = calculateInterestScore(user, meeting);
        if (interestScore > 0) reason.append("관심사 일치(").append(String.format("%.1f", interestScore)).append("점) ");

        double locationScore = calculateLocationScore(user, meeting);
        if (locationScore > 0) reason.append("지역 근접(").append(String.format("%.1f", locationScore)).append("점) ");

        double popularityScore = calculatePopularityScore(meeting);
        if (popularityScore > 0) reason.append("인기도(").append(String.format("%.1f", popularityScore)).append("점) ");

        double freshnessScore = calculateFreshnessScore(meeting);
        if (freshnessScore > 0) reason.append("신규(").append(String.format("%.1f", freshnessScore)).append("점)");

        return reason.toString().trim();
    }
}