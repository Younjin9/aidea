package com.aidea.backend.domain.recommendation.repository;

import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Slf4j
@Repository
@RequiredArgsConstructor
public class MySqlRecommendationRepository {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 사용자 관심사에 대한 모임 카테고리별 유사도 계산
     */
    public Map<String, Double> calculateUserInterestVector(Long userId) {
        String sql = """
            SELECT i.interest_id, COUNT(*) as weight
            FROM user_interest ui
            JOIN interest i ON ui.interest_id = i.interest_id
            WHERE ui.user_id = ?
            GROUP BY i.interest_id
            ORDER BY weight DESC
        """;
        
        Map<String, Double> result = new HashMap<>();
        jdbcTemplate.query(sql, (rs) -> {
            String interestId = rs.getString("interest_id");
            double weight = rs.getDouble("weight");
            result.put(interestId, weight);
        }, userId);
        
        return result;
    }

    /**
     * 모임 카테고리별 벡터 가져오기
     */
    public Map<Long, double[]> getMeetingCategoryVectors(List<Long> meetingIds) {
        if (meetingIds == null || meetingIds.isEmpty()) {
            return Map.of();
        }

        String placeholders = meetingIds.stream()
                .map(id -> "?")
                .collect(Collectors.joining(","));

        String sql = String.format("""
            SELECT h.meeting_id, 
                   GROUP_CONCAT(i.interest_id ORDER BY i.interest_id SEPARATOR ';') as interest_ids,
                   SUM(CASE 
                       WHEN i.interest_id IN ('interest_1', 'interest_2', 'interest_3', 'interest_4') THEN 0.8
                       WHEN i.interest_id IN ('interest_5', 'interest_6') THEN 0.6
                       ELSE 0.4
                   END) as total_weight
            FROM meeting_hobby h
            JOIN interest i ON h.interest_id = i.interest_id
            WHERE h.meeting_id IN (%s)
            GROUP BY h.meeting_id
        """, placeholders);

        Map<Long, double[]> result = new HashMap<>();
        
        try {
            jdbcTemplate.query(sql, (rs) -> {
                Long meetingId = rs.getLong("meeting_id");
                String interestIds = rs.getString("interest_ids");
                double totalWeight = rs.getDouble("total_weight");
                
                double[] vector = new double[8]; // 8차원 벡터 (interest_id 1~8)
                
                if (interestIds != null && !interestIds.isBlank()) {
                    String[] ids = interestIds.split(";");
                    for (String id : ids) {
                        try {
                            int index = Integer.parseInt(id.replaceAll("[^0-9]", "")) - 1; // interest_1 -> 0
                            if (index >= 0 && index < 8) {
                                vector[index] = 0.8; // 관심사가 있으면 0.8 가중치
                            }
                        } catch (NumberFormatException e) {
                            log.warn("Invalid interest_id format: {}", id);
                        }
                    }
                }
                
                result.put(meetingId, vector);
            }, meetingIds.toArray());
        } catch (Exception e) {
            log.error("[RECO-VECTOR] 벡터 계산 중 오류: {}", e.getMessage());
            return Map.of();
        }
        
        log.info("[RECO-VECTOR] 계산된 모임 벡터 크기: {}", result.size());
        return result;
    }

    /**
     * email로 userId 조회
     */
    public java.util.Optional<Long> findUserIdByEmail(String email) {
        String sql = "SELECT user_id FROM users WHERE email = ?";
        try {
            Long userId = jdbcTemplate.queryForObject(sql, Long.class, email);
            log.info("[USER_LOOKUP] email={}, userId={}", email, userId);
            return java.util.Optional.ofNullable(userId);
        } catch (Exception e) {
            log.error("[USER_LOOKUP] Failed to find userId for email={}: {}", email, e.getMessage());
            return java.util.Optional.empty();
        }
    }

    /**
     * 사용자 카테고리 이름 목록 조회 (관심사 기반)
     */
    public List<String> findUserCategoryNamesByUserId(Long userId) {
        String sql = """
            SELECT DISTINCT i.category
            FROM user_interest ui
            JOIN interest i ON ui.interest_id = i.interest_id
            WHERE ui.user_id = ?
        """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("category"), userId);
    }

    /**
     * 카테고리별 모임 ID 목록 조회
     */
    public List<Long> findMeetingIdsByCategories(List<String> categories) {
        if (categories == null || categories.isEmpty()) {
            return List.of();
        }
        
        String placeholders = categories.stream()
                .map(c -> "?")
                .collect(Collectors.joining(","));
                
        String sql = String.format("""
            SELECT DISTINCT m.id 
            FROM meeting m 
            WHERE m.category IN (%s)
        """, placeholders);
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong("id"), categories.toArray());
    }

    /**
     * 사용자 관심사 ID 목록 조회
     */
    public List<Long> findMeetingIdsByUserInterests(Long userId) {
        String sql = """
            SELECT DISTINCT mh.meeting_id
            FROM meeting_hobby mh
            JOIN user_interest ui ON mh.interest_id = ui.interest_id
            WHERE ui.user_id = ?
        """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong("meeting_id"), userId);
    }

    /**
     * 취미 ID로 이름 조회
     */
    public String findHobbyNameById(Long hobbyId) {
        String sql = "SELECT interest_name FROM interest WHERE interest_id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, String.class, hobbyId);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 취미 ID 목록으로 이름 맵 조회
     */
    public Map<Long, String> findHobbyNamesByIds(List<Long> hobbyIds) {
        if (hobbyIds == null || hobbyIds.isEmpty()) {
            return Map.of();
        }
        
        String placeholders = hobbyIds.stream()
                .map(id -> "?")
                .collect(Collectors.joining(","));
                
        String sql = String.format("SELECT interest_id, interest_name FROM interest WHERE interest_id IN (%s)", placeholders);
        
        Map<Long, String> result = new HashMap<>();
        jdbcTemplate.query(sql, (rs) -> {
            result.put(rs.getLong("interest_id"), rs.getString("interest_name"));
        }, hobbyIds.toArray());
        
        return result;
    }

    /**
     * 모든 interest ID 목록 조회
     */
    public List<Long> findAllHobbyIds() {
        return jdbcTemplate.queryForList(
                "SELECT interest_id FROM interest",
                Long.class
        );
    }
}