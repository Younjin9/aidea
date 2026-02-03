package com.aidea.backend.domain.recommendation.service;

import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.recommendation.dto.RecommendedMeetingCardResponse;
import com.aidea.backend.domain.recommendation.repository.MySqlRecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final MySqlRecommendationRepository mySqlRepo;
    private final MeetingRepository meetingRepository;
    private final JdbcTemplate jdbcTemplate;

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

        switch (safeMode) {
            case "category":
                return recommendByCategory(userId, limit);
            case "vector":
                return recommendByVector(userId, topK, limit);
            case "mvp":
                return recommendByMVP(userId, limit);
            default:
                log.warn("[RECO] Unknown mode='{}', fallback to category. userId={}", safeMode, userId);
                return recommendByCategory(userId, limit);
        }
    }

    /**
     * ✅ 카테고리 기반 추천
     * 1) user가 선택한 취미들의 카테고리 목록 조회
     * 2) meeting.category IN (userCategories) 로 후보 모임 조회
     * 3) 카드 응답 생성 후 limit
     */
    private List<RecommendedMeetingCardResponse> recommendByCategory(Long userId, int limit) {

        // 1) 유저 카테고리 조회 (user_hobby -> hobby.category) - 한글 이름으로 조회
        List<String> userCategoryDisplayNames = mySqlRepo.findUserCategoryNamesByUserId(userId);
        log.info("[RECO-CATEGORY] userId={}, userCategoryDisplayNames={}", userId, userCategoryDisplayNames);
        
        // 2) 한글 이름을 enum 이름으로 변환
        Map<String, String> categoryMap = Map.of(
            "취미 / 여가", "HOBBY_LEISURE",
            "운동 / 액티비티", "SPORTS", 
            "문화 / 예술", "CULTURE_ART",
            "자기계발 / 공부", "STUDY_SELF_DEV",
            "여행 / 나들이", "TRAVEL",
            "콘텐츠 / 미디어", "CONTENT_MEDIA"
        );
        
        List<String> userCategories = userCategoryDisplayNames.stream()
                .map(categoryMap::get)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        
        log.info("[RECO-CATEGORY] userId={}, userCategories={}", userId, userCategories);
        
        if (userCategories.isEmpty()) {
            log.info("[RECO-CATEGORY] userId={} userCategories=0 -> empty", userId);
            return List.of();
        }

        // 2) 해당 카테고리의 모임 id 조회
        // 강력한 디버깅: 직접 DB 조회
        List<Long> meetingIds = null;
        
        log.info("[DEBUG] 직접 DB 카테고리 확인:");
        jdbcTemplate.query("SELECT id, category FROM meeting ORDER BY id", (rs) -> {
            log.info("[DEBUG] 모임: id={}, category={}", rs.getLong("id"), rs.getString("category"));
        });
        
        log.info("[DEBUG] 직접 쿼리 실행:");
        try {
            meetingIds = jdbcTemplate.query(
                "SELECT id FROM meeting WHERE category = ?", 
                (rs, rowNum) -> rs.getLong("id"), 
                "HOBBY_LEISURE"
            );
            log.info("[DEBUG] 직접 쿼리 결과: {}", meetingIds);
        } catch (Exception e) {
            log.error("[DEBUG] 직접 쿼리 실패: {}", e.getMessage());
        }
        
        // 원래 메서드도 시도
        List<Long> originalMeetingIds = mySqlRepo.findMeetingIdsByCategories(userCategories);
        log.info("[RECO-CATEGORY] userId={}, originalMeetingIds={}", userId, originalMeetingIds);
        
        meetingIds = originalMeetingIds;
        
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

                    // 모임 이미지 URL 생성
                    String imageUrl = meeting.getImageUrl();
                    if (imageUrl == null || imageUrl.isBlank()) {
                        imageUrl = "https://images.unsplash.com/photo-" + meeting.getId() + "?q=80&w=400&auto=format&fit=crop";
                    }
                    
                    return new RecommendedMeetingCardResponse(
                            meeting.getId(),
                            meeting.getTitle(),
                            meeting.getCategory().name(),
                            meeting.getRegion().name(),
                            meeting.getCurrentMembers(),
                            meeting.getMaxMembers(),
                            score,
                            reason,
                            imageUrl
                    );
                })
                .filter(Objects::nonNull)
                .filter(card -> card.getScore() > 0)
                .limit(limit)
                .toList();

        // 디버깅: 각 모임의 카테고리 확인
        List<String> meetingCategories = meetings.stream()
                .map(m -> m.getCategory() != null ? m.getCategory().name() : "NULL")
                .toList();
        
        log.info("[RECO-CATEGORY] userId={}, userCategories={}, meetingIds={}, meetingCategories={}, result={}",
                userId, userCategories, distinctMeetingIds.size(), result.size());

        return result;
    }

    /**
     * 벡터 기반 추천 (user_hobby 벡터 유사도)
     */
    private List<RecommendedMeetingCardResponse> recommendByVector(Long userId, int topK, int limit) {
        // TODO: 사용자 관심사 벡터와 모임 카테고리 벡터의 유사도 계산
        log.info("[RECO-VECTOR] userId={}, topK={}, limit={}", userId, topK, limit);
        
        // 임시: category 기반으로 대체 (벡터 계산 로직은 나중에 구현)
        return recommendByCategory(userId, limit);
    }

    /**
     * MVP 추천 (가장 간단한 추천)
     */
    private List<RecommendedMeetingCardResponse> recommendByMVP(Long userId, int limit) {
        log.info("[RECO-MVP] userId={}, limit={}", userId, limit);
        
        // 임시: 인기있는 모임 반환
        // TODO: 인기도, 참여율 등 기반 추천 로직 구현
        return recommendByCategory(userId, limit);
    }
}
