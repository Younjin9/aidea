package com.aidea.backend.domain.recommendation.vector;

import com.aidea.backend.domain.ai.service.TitanEmbeddingService;
import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.recommendation.repository.MySqlRecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.stream.Collectors;

import java.util.List;
import java.util.Map;

/**
 * 🎯 원래 설계대로 벡터 저장소 구현
 * - Titan 임베딩을 PostgreSQL pgvector에 영구 저장
 * - 추천 시 저장된 벡터만 사용 (API 호출 최소화)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VectorStorageService {

    private final TitanEmbeddingService titanEmbeddingService;
    private final MySqlRecommendationRepository mySqlRepo;
    private final MeetingRepository meetingRepository;
    private final JdbcTemplate jdbcTemplate;

    /**
     * ✅ 모든 모임의 벡터를 생성하고 저장
     */
    @Transactional
    public void seedAllMeetingVectors() {
        log.info("[VECTOR-SEED] 모든 모임 벡터 시딩 시작");

        // 1. 모든 모임 조회
        List<Meeting> meetings = meetingRepository.findAll();
        int total = meetings.size();
        int success = 0;
        int failed = 0;

        for (Meeting meeting : meetings) {
            try {
                // 2. 모임 텍스트 생성
                String meetingText = mySqlRepo.getMeetingEmbeddingText(meeting.getId());
                if (meetingText == null || meetingText.isBlank()) {
                    log.warn("[VECTOR-SEED] 모임 {} 텍스트 없음, 건너뜀", meeting.getId());
                    continue;
                }

                // 3. Titan 임베딩 생성
                float[] embedding = titanEmbeddingService.embed(meetingText);

                // 4. PostgreSQL에 저장
                saveMeetingVector(meeting.getId(), embedding);

                success++;
                log.info("[VECTOR-SEED] 모임 {} 벡터 저장 완료 ({}/{})",
                        meeting.getId(), success, total);

            } catch (Exception e) {
                failed++;
                log.error("[VECTOR-SEED] 모임 {} 벡터 저장 실패: {}",
                        meeting.getId(), e.getMessage());
            }
        }

        log.info("[VECTOR-SEED] 모든 모임 벡터 시딩 완료: 성공 {}, 실패 {}", success, failed);
    }

    /**
     * ✅ 모든 사용자의 벡터를 생성하고 저장
     */
    @Transactional
    public void seedAllUserVectors() {
        log.info("[VECTOR-SEED] 모든 사용자 벡터 시딩 시작");

        // 1. 사용자 목록 조회 (모든 사용자 ID 가져오기)
        String sql = "SELECT DISTINCT user_id FROM users";
        List<Long> userIds = jdbcTemplate.queryForList(sql, Long.class);
        int total = userIds.size();
        int success = 0;
        int failed = 0;

        for (Long userId : userIds) {
            try {
                // 2. 사용자 관심사 텍스트 생성
                List<String> userInterests = mySqlRepo.findUserInterestNames(userId);
                if (userInterests.isEmpty()) {
                    log.warn("[VECTOR-SEED] 사용자 {} 관심사 없음, 건너뜀", userId);
                    continue;
                }

                String userText = String.join(" ", userInterests);

                // 3. Titan 임베딩 생성
                float[] embedding = titanEmbeddingService.embed(userText);

                // 4. PostgreSQL에 저장
                saveUserVector(userId, embedding);

                success++;
                log.info("[VECTOR-SEED] 사용자 {} 벡터 저장 완료 ({}/{})",
                        userId, success, total);

            } catch (Exception e) {
                failed++;
                log.error("[VECTOR-SEED] 사용자 {} 벡터 저장 실패: {}",
                        userId, e.getMessage());
            }
        }

        log.info("[VECTOR-SEED] 모든 사용자 벡터 시딩 완료: 성공 {}, 실패 {}", success, failed);
    }

    /**
     * ✅ 모임 벡터 저장
     */
    private void saveMeetingVector(Long meetingId, float[] embedding) {
        // float[] → String 변환 (PostgreSQL vector 형식: "[1.0, 2.0, 3.0]")
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0)
                sb.append(",");
            sb.append(embedding[i]);
        }
        sb.append("]");
        String vectorString = sb.toString();

        String sql = """
                INSERT INTO meeting_vectors (meeting_id, embedding)
                VALUES (?, ?::vector)
                ON CONFLICT (meeting_id) DO UPDATE SET
                    embedding = EXCLUDED.embedding,
                    created_at = CURRENT_TIMESTAMP
                """;
        
        jdbcTemplate.update(sql, meetingId, vectorString);
    }

    /**
     * ✅ 사용자 벡터 저장
     */
    private void saveUserVector(Long userId, float[] embedding) {
        // float[] → String 변환 (PostgreSQL vector 형식: "[1.0, 2.0, 3.0]")
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0)
                sb.append(",");
            sb.append(embedding[i]);
        }
        sb.append("]");
        String vectorString = sb.toString();

        String sql = """
                INSERT INTO user_vectors (user_id, embedding)
                VALUES (?, ?::vector)
                ON CONFLICT (user_id) DO UPDATE SET
                    embedding = EXCLUDED.embedding,
                    updated_at = CURRENT_TIMESTAMP
                """;
        
        jdbcTemplate.update(sql, userId, vectorString);
    }

    /**
     * ✅ 저장된 모임 벡터로 유사도 계산
     */
    public List<Long> findSimilarMeetings(Long userId, int limit) {
        String sql = """
                SELECT m.meeting_id
                FROM meetings m
                JOIN meeting_vectors mv ON m.meeting_id = mv.meeting_id
                JOIN user_vectors uv ON uv.user_id = ?
                ORDER BY (mv.embedding <=> uv.embedding)
                LIMIT ?
                """;

        return jdbcTemplate.queryForList(sql, Long.class, userId, limit);
    }

    /**
     * ✅ 벡터 저장소 상태 확인
     */
    public Map<String, Integer> getVectorStorageStatus() {
        String meetingCountSql = "SELECT COUNT(*) as count FROM meeting_vectors";
        String userCountSql = "SELECT COUNT(*) as count FROM user_vectors";

        int meetingVectorCount = jdbcTemplate.queryForObject(meetingCountSql, Integer.class);
        int userVectorCount = jdbcTemplate.queryForObject(userCountSql, Integer.class);

        return Map.of(
                "meetingVectors", meetingVectorCount,
                "userVectors", userVectorCount);
    }
}