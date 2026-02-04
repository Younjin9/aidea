package com.aidea.backend.domain.recommendation.service;

import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.recommendation.dto.RecommendedMeetingCardResponse;
import com.aidea.backend.domain.recommendation.repository.MySqlRecommendationRepository;
import com.aidea.backend.domain.recommendation.vector.VectorStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 🎯 원래 설계대로 구현된 추천 서비스
 * - 저장된 벡터 사용 (API 호출 최소화)
 * - 빠른 pgvector 유사도 검색
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OptimizedRecommendationService {

    private final MySqlRecommendationRepository mySqlRepo;
    private final MeetingRepository meetingRepository;
    private final VectorStorageService vectorStorage;

    /**
     * ✅ 저장된 벡터 기반 AI 추천 (원래 설계대로)
     */
    public List<RecommendedMeetingCardResponse> recommendByStoredVectors(Long userId, int limit) {
        log.info("[AI-OPTIMIZED] 저장된 벡터 기반 추천 시작. userId={}, limit={}", userId, limit);

        try {
            // 1. 사용자 벡터 확인
            Map<String, Integer> status = vectorStorage.getVectorStorageStatus();
            int userVectorCount = status.get("userVectors");
            int meetingVectorCount = status.get("meetingVectors");

            log.info("[AI-OPTIMIZED] 현재 벡터 저장 상태: 사용자={}, 모임={}",
                    userVectorCount, meetingVectorCount);

            if (userVectorCount == 0 || meetingVectorCount == 0) {
                log.warn("[AI-OPTIMIZED] 벡터 저장소가 비어있음, fallback to API 기반");
                // 벡터 시딩 실행
                vectorStorage.seedAllUserVectors();
                vectorStorage.seedAllMeetingVectors();

                // 잠시 대기 후 다음 시도
                return recommendByStoredVectors(userId, limit);
            }

            // 2. 저장된 벡터로 유사 모임 검색 (pgvector)
            List<Long> similarMeetingIds = vectorStorage.findSimilarMeetings(userId, limit);

            if (similarMeetingIds.isEmpty()) {
                log.warn("[AI-OPTIMIZED] 유사 모임 없음, fallback to category");
                return recommendByCategory(userId, limit);
            }

            // 3. Meeting 엔티티 조회
            List<Meeting> meetings = meetingRepository.findAllById(similarMeetingIds);

            // 4. 응답 변환
            return meetings.stream()
                    .map(meeting -> RecommendedMeetingCardResponse.builder()
                            .meetingId(meeting.getId())
                            .title(meeting.getTitle())
                            .category(meeting.getCategory().name()) // Enum to String 변환
                            .region(meeting.getRegion().name()) // Enum to String 변환
                            .currentMembers(meeting.getCurrentMembers())
                            .maxMembers(meeting.getMaxMembers())
                            .score(1.0) // pgvector 유사도 기반
                            .reason("AI 벡터 유사도 기반 추천 (저장된 벡터 사용)")
                            .imageUrl(meeting.getImageUrl() != null ? meeting.getImageUrl()
                                    : "/src/assets/images/logo.png")
                            .build())
                    .limit(limit)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("[AI-OPTIMIZED] 저장된 벡터 추천 실패: {}", e.getMessage(), e);
            // 기존 방식으로 fallback
            return recommendByCategory(userId, limit);
        }
    }

    /**
     * ✅ 카테고리 기반 추천 (기존 방식 유지)
     */
    public List<RecommendedMeetingCardResponse> recommendByCategory(Long userId, int limit) {
        List<Long> candidateIds = mySqlRepo.findMeetingIdsByUserInterests(userId);
        if (candidateIds.isEmpty()) {
            return List.of();
        }

        List<Meeting> meetings = meetingRepository.findAllById(candidateIds);

        return meetings.stream()
                .limit(limit)
                .map(meeting -> RecommendedMeetingCardResponse.builder()
                        .meetingId(meeting.getId())
                        .title(meeting.getTitle())
                        .category(meeting.getCategory().name())
                        .region(meeting.getRegion().name())
                        .currentMembers(meeting.getCurrentMembers())
                        .maxMembers(meeting.getMaxMembers())
                        .score(1.0)
                        .reason("선택한 관심 카테고리와 같은 모임이에요")
                        .imageUrl(meeting.getImageUrl() != null ? meeting.getImageUrl() : "/src/assets/images/logo.png")
                        .build())
                .collect(Collectors.toList());
    }
}