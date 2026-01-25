package com.aidea.backend.domain.recommendation.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aidea.backend.domain.recommendation.dto.RecommendedMeetingResponse;
import com.aidea.backend.domain.recommendation.repository.HobbyVectorRepository;
import com.aidea.backend.domain.recommendation.repository.MySqlRecommendationRepository;

@Service
public class RecommendationService {

    private final MySqlRecommendationRepository mySqlRepo;
    private final HobbyVectorRepository hobbyVectorRepo;

    public RecommendationService(MySqlRecommendationRepository mySqlRepo, HobbyVectorRepository hobbyVectorRepo) {
        this.mySqlRepo = mySqlRepo;
        this.hobbyVectorRepo = hobbyVectorRepo;
    }

    @Transactional(readOnly = true)
    public List<RecommendedMeetingResponse> recommendMeetingsByNickname(String nickname, int topK, int limit) {
        Long userId = mySqlRepo.findUserIdByNickname(nickname);
        List<Long> selectedHobbyIds = mySqlRepo.findSelectedHobbyIdsByUserId(userId);

        if (selectedHobbyIds == null || selectedHobbyIds.isEmpty()) {
            return List.of();
        }

        // 1) Postgres: 유저 취미 평균 벡터 기준 TOP-K 취미
        List<Map<String, Object>> topHobbies = hobbyVectorRepo.findTopHobbiesByUserVector(selectedHobbyIds, topK);

        // 2) MySQL: TOP-K 취미에 연결된 meeting_id 모으기
        List<Long> candidateHobbyIds = new ArrayList<>();
        for (Map<String, Object> row : topHobbies) {
            candidateHobbyIds.add(((Number) row.get("hobby_id")).longValue());
        }

        if (candidateHobbyIds.isEmpty()) return List.of();

        List<Long> meetingIds = mySqlRepo.findMeetingIdsByHobbyIds(candidateHobbyIds);

        // 3) MVP: 모임 점수는 일단 "취미 거리 최소값" 기반으로 단순 계산(추후 meeting_hobby 조인으로 정확화)
        // 지금은 meetingIds만 반환해도 프론트에서 테스트 가능하도록 score=0.0 처리
        return meetingIds.stream()
                .distinct()
                .limit(limit)
                .map(id -> new RecommendedMeetingResponse(id, 0.0))
                .toList();
    }
}