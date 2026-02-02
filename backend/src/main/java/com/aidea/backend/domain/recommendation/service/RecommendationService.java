package com.aidea.backend.domain.recommendation.service;

import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.recommendation.dto.RecommendedMeetingCardResponse;
import com.aidea.backend.domain.recommendation.repository.HobbyVectorQueryRepository;
import com.aidea.backend.domain.recommendation.repository.MySqlRecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final MySqlRecommendationRepository mySqlRepo;
    private final MeetingRepository meetingRepository;

    // ✅ 벡터 확장 후보(TopK 취미) 조회용 레포가 이미 있다면 사용
    // 없으면 주입 제거하고 recommendVector에서 selectedHobbyIds만 사용해도 됨
    private final HobbyVectorQueryRepository hobbyVectorQueryRepository;

    /**
     * ✅ 정식 엔트리포인트 (email -> userId)
     * 여기까지는 이미 잘 붙어있는 상태
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
     * userId 기반 추천 분기
     */
    public List<RecommendedMeetingCardResponse> recommendMeetingsByUserId(
            Long userId, int topK, int limit, String mode
    ) {
        topK = Math.max(1, Math.min(topK, 50));
        limit = Math.max(1, Math.min(limit, 30));

        // ✅ mode 정규화 + 기본값(vector)
        String safeMode = (mode == null || mode.isBlank())
                ? "vector"
                : mode.trim().toLowerCase();

        // ✅ 명시적 분기
        if ("vector".equals(safeMode)) {
            return recommendVector(userId, topK, limit);
        }

        if ("basic".equals(safeMode) || "mvp".equals(safeMode)) {
            return recommendMvp(userId, limit);
        }

        // ✅ 알 수 없는 mode면 vector로 fallback (안전)
        log.warn("[RECO] unknown mode='{}' -> fallback to vector. userId={}", safeMode, userId);
        return recommendVector(userId, topK, limit);
    }

    /**
     * ✅ Vector 추천 (TopK 후보 취미 확장 → 그 취미들이 포함된 모임 조회 → 점수/이유 생성)
     */
    private List<RecommendedMeetingCardResponse> recommendVector(Long userId, int topK, int limit) {
        // 1) 유저가 직접 선택한 취미
        List<Long> selectedHobbyIds = mySqlRepo.findSelectedHobbyIdsByUserId(userId);
        if (selectedHobbyIds == null || selectedHobbyIds.isEmpty()) {
            log.info("[RECO-VECTOR] userId={} selectedHobbyIds=0 -> empty", userId);
            return List.of();
        }

        // 2) (선택) 벡터로 확장된 후보 취미 TopK
        //    - 레포가 없거나 결과가 비면 selectedHobbyIds로 fallback
        List<Long> candidateHobbyIds = List.of();
        try {
            candidateHobbyIds = hobbyVectorQueryRepository.findTopKHobbyIdsByUserId(userId, topK);
        } catch (Exception e) {
            // hobbyVectorQueryRepository 주입은 했지만 아직 구현/테이블이 미완이면 여기로 들어올 수 있음
            log.warn("[RECO-VECTOR] vector topK query failed -> fallback to selected. userId={}, err={}", userId, e.getMessage());
        }

        if (candidateHobbyIds == null || candidateHobbyIds.isEmpty()) {
            candidateHobbyIds = selectedHobbyIds;
        }

        // 3) 후보 취미가 포함된 모임 id들
        List<Long> meetingIds = mySqlRepo.findMeetingIdsByHobbyIds(candidateHobbyIds);
        if (meetingIds == null || meetingIds.isEmpty()) {
            log.info("[RECO-VECTOR] userId={} meetingIds=0 -> empty", userId);
            return List.of();
        }

        // 4) meetingId -> [hobbyId...] 한번에 조회 (join 결과)
        Map<Long, List<Long>> meetingToHobbyIds = mySqlRepo.findHobbyIdsGroupedByMeetingIds(meetingIds);

        // 5) meetingIds 중복 제거 후 모임 엔티티 조회
        List<Long> distinctMeetingIds = meetingIds.stream().distinct().toList();
        List<Meeting> meetings = meetingRepository.findAllById(distinctMeetingIds);

        // 6) matched 취미 name을 N+1 없이 한번에 뽑기
        List<Long> allMatchedHobbyIds = meetings.stream()
                .flatMap(m -> meetingToHobbyIds.getOrDefault(m.getId(), List.of()).stream()
                        .filter(selectedHobbyIds::contains))
                .distinct()
                .toList();

        Map<Long, String> hobbyNameMapAll =
                allMatchedHobbyIds.isEmpty() ? Map.of() : mySqlRepo.findHobbyNamesByIds(allMatchedHobbyIds);

        // 7) 카드 생성 + 점수 계산 + 정렬 + limit
        List<RecommendedMeetingCardResponse> result = meetings.stream()
                .map(meeting -> {
                    List<Long> meetingHobbyIds = meetingToHobbyIds.getOrDefault(meeting.getId(), List.of());

                    List<Long> matchedHobbyIds = meetingHobbyIds.stream()
                            .filter(selectedHobbyIds::contains)
                            .toList();

                    long overlapCount = matchedHobbyIds.size();
                    double score = (double) overlapCount / (double) selectedHobbyIds.size();

                    List<String> matchedHobbyNames = matchedHobbyIds.stream()
                            .map(hobbyNameMapAll::get)
                            .filter(Objects::nonNull)
                            .toList();

                    String reason;
                    if (matchedHobbyNames.isEmpty()) {
                        reason = "관심사 기반으로 추천된 모임이에요";
                    } else {
                        reason = "선택한 취미 중 "
                                + String.join(", ", matchedHobbyNames)
                                + "와(과) 잘 맞는 모임이에요";
                    }

                    // ⚠️ 아래 getter들은 Meeting 엔티티 필드에 맞게 이름 조정 필요할 수 있음
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
                .filter(card -> card.getScore() > 0)
                .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
                .limit(limit)
                .toList();

        log.info("[RECO-VECTOR] userId={}, selected={}, candidate={}, meetingCandidate={}, result={}",
                userId,
                selectedHobbyIds.size(),
                candidateHobbyIds.size(),
                distinctMeetingIds.size(),
                result.size()
        );

        return result;
    }

    /**
     * ✅ MVP 추천 (AI 없이 단순 겹치는 취미 기반)
     * - selectedHobbyIds를 기준으로 meeting을 찾고
     * - overlap 기반 점수/이유 생성
     */
    private List<RecommendedMeetingCardResponse> recommendMvp(Long userId, int limit) {
        List<Long> selectedHobbyIds = mySqlRepo.findSelectedHobbyIdsByUserId(userId);
        if (selectedHobbyIds == null || selectedHobbyIds.isEmpty()) {
            return List.of();
        }

        List<Long> meetingIds = mySqlRepo.findMeetingIdsByHobbyIds(selectedHobbyIds);
        if (meetingIds == null || meetingIds.isEmpty()) {
            return List.of();
        }

        Map<Long, List<Long>> meetingToHobbyIds = mySqlRepo.findHobbyIdsGroupedByMeetingIds(meetingIds);

        List<Long> distinctMeetingIds = meetingIds.stream().distinct().toList();
        List<Meeting> meetings = meetingRepository.findAllById(distinctMeetingIds);

        List<Long> allMatchedHobbyIds = meetings.stream()
                .flatMap(m -> meetingToHobbyIds.getOrDefault(m.getId(), List.of()).stream()
                        .filter(selectedHobbyIds::contains))
                .distinct()
                .toList();

        Map<Long, String> hobbyNameMapAll =
                allMatchedHobbyIds.isEmpty() ? Map.of() : mySqlRepo.findHobbyNamesByIds(allMatchedHobbyIds);

        return meetings.stream()
                .map(meeting -> {
                    List<Long> meetingHobbyIds = meetingToHobbyIds.getOrDefault(meeting.getId(), List.of());

                    List<Long> matchedHobbyIds = meetingHobbyIds.stream()
                            .filter(selectedHobbyIds::contains)
                            .toList();

                    long overlapCount = matchedHobbyIds.size();
                    double score = (double) overlapCount / (double) selectedHobbyIds.size();

                    List<String> matchedHobbyNames = matchedHobbyIds.stream()
                            .map(hobbyNameMapAll::get)
                            .filter(Objects::nonNull)
                            .toList();

                    String reason = matchedHobbyNames.isEmpty()
                            ? "관심사 기반으로 추천된 모임이에요"
                            : "선택한 취미 중 " + String.join(", ", matchedHobbyNames) + "와(과) 잘 맞는 모임이에요";

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
                .filter(card -> card.getScore() > 0)
                .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
                .limit(limit)
                .toList();
    }
}