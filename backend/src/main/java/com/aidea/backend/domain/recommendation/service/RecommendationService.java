package com.aidea.backend.domain.recommendation.service;

import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.recommendation.dto.RecommendedMeetingCardResponse;
import com.aidea.backend.domain.recommendation.repository.MySqlRecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final MySqlRecommendationRepository mySqlRepo;
    private final MeetingRepository meetingRepository;

    /**
     * ✅ 정식 엔트리포인트 (email -> userId)
     */
    public List<RecommendedMeetingCardResponse> recommendMeetingsByEmail(
            String email, int topK, int limit, String mode
    ) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 정보(email)가 없습니다.");
        }

        Long userId = mySqlRepo.findUserIdByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "유저 정보를 찾을 수 없습니다. (email로 userId 조회 실패)"
                ));

        return recommendMeetingsByUserId(userId, topK, limit, mode);
    }

    /**
     * ✅ userId 기반 추천 (카테고리 기반)
     * - mode는 남겨두되, 지금은 category로 동작하도록 구성
     */
    public List<RecommendedMeetingCardResponse> recommendMeetingsByUserId(
            Long userId, int topK, int limit, String mode
    ) {
        limit = Math.max(1, Math.min(limit, 30));

        // mode 정규화 + 기본값(category)
        String safeMode = (mode == null || mode.isBlank())
                ? "category"
                : mode.trim().toLowerCase();

        // 지금은 category 기반만 사용 (vector/mvp는 기존 취미 기반이라 의미 없음)
        if (!"category".equals(safeMode)) {
            log.warn("[RECO] mode='{}' requested but category-only is enabled. fallback to category. userId={}", safeMode, userId);
        }

        return recommendByCategory(userId, limit);
    }

    /**
     * ✅ 카테고리 기반 추천
     * 1) user가 선택한 취미들의 카테고리 목록 조회
     * 2) meeting.category IN (userCategories) 로 후보 모임 조회
     * 3) 카드 응답 생성 후 limit
     */
    private List<RecommendedMeetingCardResponse> recommendByCategory(Long userId, int limit) {

        // 1) 유저 카테고리 조회 (user_hobby -> hobby.category)
        List<String> userCategories = mySqlRepo.findUserCategoryNamesByUserId(userId);
        if (userCategories == null || userCategories.isEmpty()) {
            log.info("[RECO-CATEGORY] userId={} userCategories=0 -> empty", userId);
            return List.of();
        }

        // 2) 해당 카테고리의 모임 id 조회
        List<Long> meetingIds = mySqlRepo.findMeetingIdsByCategories(userCategories);
        if (meetingIds == null || meetingIds.isEmpty()) {
            log.info("[RECO-CATEGORY] userId={} meetingIds=0 -> empty (userCategories={})", userId, userCategories);
            return List.of();
        }

        List<Long> distinctMeetingIds = meetingIds.stream().distinct().toList();

        // 3) Meeting 엔티티 조회
        List<Meeting> meetings = meetingRepository.findAllById(distinctMeetingIds);
        if (meetings == null || meetings.isEmpty()) {
            log.info("[RECO-CATEGORY] userId={} meetings=0 after findAllById", userId);
            return List.of();
        }

        // 4) 카드 생성
        List<RecommendedMeetingCardResponse> result = meetings.stream()
                .map(meeting -> {
                    String meetingCategory = (meeting.getCategory() == null) ? null : meeting.getCategory().name();

                    // score: 카테고리 일치면 1.0 (IN 조건으로 걸렀으니 보통 1.0)
                    double score = (meetingCategory != null && userCategories.contains(meetingCategory)) ? 1.0 : 0.0;

                    String reason = (meetingCategory == null)
                            ? "선택한 관심 카테고리와 맞는 모임이에요"
                            : "선택한 관심 카테고리(" + meetingCategory + ")와(과) 같은 모임이에요";

                    return new RecommendedMeetingCardResponse(
                            meeting.getId(),
                            meeting.getTitle(),
                            meeting.getCategory().name(),
                            meeting.getRegion().name(),
                            meeting.getCurrentMembers(),
                            meeting.getMaxMembers(),
                            score,
                            reason
                    );
                })
                .filter(Objects::nonNull)
                .filter(card -> card.getScore() > 0)
                .limit(limit)
                .toList();

        log.info("[RECO-CATEGORY] userId={}, userCategories={}, meetingCandidate={}, result={}",
                userId, userCategories, distinctMeetingIds.size(), result.size());

        return result;
    }
}