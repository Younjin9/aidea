package com.aidea.backend.domain.recommendation.service;

import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.recommendation.dto.RecommendedMeetingCardResponse;
import com.aidea.backend.domain.recommendation.repository.MySqlRecommendationRepository;
import com.aidea.backend.domain.recommendation.ai.TitanEmbeddingClient;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final MySqlRecommendationRepository mySqlRepo;
    private final MeetingRepository meetingRepository;
    private final JdbcTemplate jdbcTemplate;
    private final com.aidea.backend.domain.recommendation.ai.TitanEmbeddingClient embeddingClient;
    private final OptimizedRecommendationService optimizedService;

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
            case "ai":
                return recommendByOptimizedAI(userId, limit);
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
     * AI 기반 추천 (Titan 임베딩 사용)
     */
    private List<RecommendedMeetingCardResponse> recommendByAI(Long userId, int topK, int limit) {
        log.info("[RECO-AI] AI 기반 추천 시작. userId={}, topK={}, limit={}", userId, topK, limit);
        
        try {
            // 1. 사용자 관심사 텍스트 벡터화
            float[] userVector = createUserEmbedding(userId);
            if (userVector == null) {
                log.warn("[RECO-AI] 사용자 벡터 생성 실패, fallback to category");
                return recommendByCategory(userId, limit);
            }

            // 2. 후보 모임 목록 조회
            List<Long> candidateMeetingIds = mySqlRepo.findMeetingIdsByUserInterests(userId);
            if (candidateMeetingIds.isEmpty()) {
                log.info("[RECO-AI] 후보 모임 없음, fallback to category");
                return recommendByCategory(userId, limit);
            }

            // 3. 모임 임베딩 계산
            Map<Long, float[]> meetingEmbeddings = createMeetingEmbeddings(candidateMeetingIds);

            // 4. Meeting 엔티티 조회
            List<Meeting> meetings = meetingRepository.findAllById(candidateMeetingIds);
            if (meetings.isEmpty()) {
                log.info("[RECO-AI] 모임 엔티티 조회 실패, fallback to category");
                return recommendByCategory(userId, limit);
            }

            // 5. 코사인 유사도 계산 및 추천
            List<RecommendedMeetingCardResponse> result = meetings.stream()
                    .map(meeting -> {
                        float[] meetingVector = meetingEmbeddings.get(meeting.getId());
                        if (meetingVector == null) {
                            return null;
                        }

                        double similarity = calculateCosineSimilarity(userVector, meetingVector);
                        double score = Math.max(0.0, Math.min(1.0, similarity));

                        String reason = String.format("AI 유사도 %.1f%% (%.1f/5.0점)", 
                            similarity * 100.0, score * 5.0);

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
                    .filter(card -> card.getScore() > 0.1) // 유사도 10% 이상만 추천
                    .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
                    .limit(limit)
                    .collect(Collectors.toList());

            log.info("[RECO-AI] AI 추천 완료: {}개 (사용자 벡터 차원: {})", 
                result.size(), userVector.length);

            if (result.isEmpty()) {
                log.info("[RECO-AI] AI 추천 결과가 없어 fallback to category");
                return recommendByCategory(userId, limit);
            }

            return result;

        } catch (Exception e) {
            log.error("[RECO-AI] AI 추천 중 오류, fallback to category: {}", e.getMessage());
            return recommendByCategory(userId, limit);
        }
    }

    /**
     * 사용자 관심사 임베딩 생성
     */
    private float[] createUserEmbedding(Long userId) {
        try {
            List<String> userInterests = mySqlRepo.findUserInterestNames(userId);
            if (userInterests.isEmpty()) {
                return null;
            }

            String userText = String.join(" ", userInterests);
            log.info("[RECO-AI] 사용자 관심사 텍스트: {}", userText);

            return embeddingClient.embedToFloatArray(userText);

        } catch (Exception e) {
            log.error("[RECO-AI] 사용자 임베딩 생성 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * ✅ 최적화된 AI 추천 (저장된 벡터 사용)
     */
    private List<RecommendedMeetingCardResponse> recommendByOptimizedAI(Long userId, int limit) {
        log.info("[RECO-OPTIMIZED] 저장된 벡터 기반 AI 추천 시작. userId={}, limit={}", userId, limit);
        
        try {
            return optimizedService.recommendByStoredVectors(userId, limit);
        } catch (Exception e) {
            log.error("[RECO-OPTIMIZED] 최적화된 추천 실패: {}", e.getMessage(), e);
            log.warn("[RECO-OPTIMIZED] 기존 AI 방식으로 fallback");
            return recommendByAI(userId, 10, limit); // 기존 방식으로 fallback
        }
    }

    /**
     * 모임 임베딩 생성
     */
    private Map<Long, float[]> createMeetingEmbeddings(List<Long> meetingIds) {
        Map<Long, float[]> result = new HashMap<>();

        for (Long meetingId : meetingIds) {
            try {
                String meetingText = mySqlRepo.getMeetingEmbeddingText(meetingId);
                if (meetingText == null || meetingText.isBlank()) {
                    continue;
                }

                float[] embedding = embeddingClient.embedToFloatArray(meetingText);
                if (embedding != null) {
                    result.put(meetingId, embedding);
                }

            } catch (Exception e) {
                log.warn("[RECO-AI] 모임 {} 임베딩 생성 실패: {}", meetingId, e.getMessage());
            }
        }

        log.info("[RECO-AI] 모임 임베딩 생성 완료: {}/{}개", result.size(), meetingIds.size());
        return result;
    }

    /**
     * 코사인 유사도 계산
     */
    private double calculateCosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null || 
            vectorA.length == 0 || vectorB.length == 0) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < Math.min(vectorA.length, vectorB.length); i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        return (normA == 0.0 || normB == 0.0) ? 0.0 : (dotProduct / (normA * normB));
    }

    /**
     * 벡터 기반 추천 (user_hobby 벡터와 meeting_hobby 벡터의 코사인 계산)
     */
    private List<RecommendedMeetingCardResponse> recommendByVector(Long userId, int topK, int limit) {
        log.info("[RECO-VECTOR] 벡터 기반 추천 시작. userId={}, topK={}, limit={}", userId, topK, limit);
        
        // 1) 사용자 관심사 벡터 계산
        Map<String, Double> userInterestVector = mySqlRepo.calculateUserInterestVector(userId);
        log.info("[RECO-VECTOR] 사용자 관심사 벡터: {}", userInterestVector.size());
        
        // 2) 후보 모임 ID 목록 (사용자 관심사 관련 모임)
        List<Long> candidateMeetingIds = mySqlRepo.findMeetingIdsByUserInterests(userId);
        log.info("[RECO-VECTOR] 후보 모임 수: {}", candidateMeetingIds.size());
        
        if (candidateMeetingIds.isEmpty()) {
            log.info("[RECO-VECTOR] 관련 모임 없음");
            return List.of();
        }
        
        // 3) 모임 벡터 계산
        Map<Long, double[]> meetingVectors = mySqlRepo.getMeetingCategoryVectors(candidateMeetingIds);
        log.info("[RECO-VECTOR] 모임 벡터 계산 완료: {}", meetingVectors.size());
        
        // 4) Meeting 엔티티 조회
        List<Meeting> meetings = meetingRepository.findAllById(candidateMeetingIds);
        log.info("[RECO-VECTOR] 모임 엔티티 조회 완료: {}", meetings.size());
        
        // 5) 코사인 유사도 계산 및 상위 topK 선택
        List<RecommendedMeetingCardResponse> result = meetings.stream()
                .map(meeting -> {
                    // 코사인 유사도 계산
                    double similarity = calculateCosineSimilarity(
                        userInterestVector, 
                        meetingVectors.get(meeting.getId())
                    );
                    
                    // 벡터 공간에서 임베딩 계산 (클수)
                    double embeddingSimilarity = 1.0 - similarity; // 코사인 거리가 가까울수록 임베딩
                    
                    String reason = String.format("관심사 유사도 %.1f%% (%.1f/5.0점)", similarity * 100.0, similarity * 5.0);
                    
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
                            embeddingSimilarity, // 실제 임베딩 유사도 사용
                            reason,
                            imageUrl
                    );
                })
                .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()) * -1) // 높은 점수 순으로 정렬
                .limit(limit)
                .collect(Collectors.toList());
        
        log.info("[RECO-VECTOR] 벡터 추천 결과: {}개", result.size());
        return result;
    }
    
    /**
     * 코사인 유사도 계산
     */
    private double calculateCosineSimilarity(Map<String, Double> vectorA, double[] vectorB) {
        if (vectorA == null || vectorB == null) return 0.0;
        
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        
        for (Map.Entry<String, Double> entry : vectorA.entrySet()) {
            String interestId = entry.getKey();
            double weightA = entry.getValue();
            double weightB = 0.0;
            
            // interest_id 1-8에 해당하는 가중치
            int index = Integer.parseInt(interestId.substring(interestId.length() - 1)) - 1; // 마지막 글자를 숫자로
            if (index >= 0 && index < 8) {
                weightB = vectorB[index];
            }
            
            dotProduct += weightA * weightB;
            normA += weightA * weightA;
            normB += weightB * weightB;
        }
        
        double norm = Math.sqrt(normA) * Math.sqrt(normB);
        
        return norm == 0.0 ? 0.0 : (dotProduct / norm);
    }

    /**
     * MVP 추천 (가장 간단한 추천)
     */
    private List<RecommendedMeetingCardResponse> recommendByMVP(Long userId, int limit) {
        log.info("[RECO-MVP] userId={}, limit={}", userId, limit);
        
        // MVP: 가장 인기 있는 모임 반환
        List<Long> candidateMeetingIds = mySqlRepo.findMeetingIdsByUserInterests(userId);
        if (candidateMeetingIds.isEmpty()) {
            return List.of();
        }
        
        // 모임 정보 조회
        List<Meeting> meetings = meetingRepository.findAllById(candidateMeetingIds);
        if (meetings.isEmpty()) {
            return List.of();
        }
        
        // MVP 추천 로직: 참여율 기반 정렬
        List<RecommendedMeetingCardResponse> result = meetings.stream()
                .map(meeting -> {
                    double participationRate = (double) meeting.getCurrentMembers() / meeting.getMaxMembers();
                    double score = participationRate >= 0.5 ? 0.9 : 0.5;
                    String reason = "참여율 높은 인기 모임이에요";
                    
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
                .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
                .limit(limit)
                .toList();
        
        log.info("[RECO-MVP] MVP 추천 결과: {}개", result.size());
        return result;
    }
}
