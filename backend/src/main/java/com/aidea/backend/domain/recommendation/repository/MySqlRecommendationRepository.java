package com.aidea.backend.domain.recommendation.repository;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.Objects;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
public class MySqlRecommendationRepository {

    private final JdbcTemplate jdbcTemplate;

    public MySqlRecommendationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ✅ (기존) nickname 기반 조회 - 혹시 다른 곳에서 쓰면 유지
    public Long findUserIdByNickname(String nickname) {
        return jdbcTemplate.queryForObject(
                "SELECT user_id FROM users WHERE nickname = ?",
                Long.class,
                nickname
        );
    }

    // ✅ (신규) email 기반 조회 - 정식 해결에서 사용
    public Optional<Long> findUserIdByEmail(String email) {
        String sql = "SELECT user_id FROM users WHERE email = ? LIMIT 1";
        return jdbcTemplate.query(sql, rs -> {
            if (rs.next()) return Optional.of(rs.getLong("user_id"));
            return Optional.empty();
        }, email);
    }

    public List<Long> findSelectedHobbyIdsByUserId(Long userId) {
        return jdbcTemplate.queryForList(
                "SELECT interest_id FROM user_interest WHERE user_id = ?",
                Long.class,
                userId
        );
    }

    public List<Long> findMeetingIdsByHobbyIds(List<Long> hobbyIds) {
        String inSql = String.join(",", hobbyIds.stream().map(x -> "?").toList());
        String sql = "SELECT DISTINCT meeting_id FROM meeting_interest WHERE interest_id IN (" + inSql + ")";
        return jdbcTemplate.queryForList(sql, Long.class, hobbyIds.toArray());
    }

    public Map<Long, List<Long>> findHobbyIdsGroupedByMeetingIds(List<Long> meetingIds) {
        if (meetingIds == null || meetingIds.isEmpty()) {
            return Map.of();
        }

        String placeholders = meetingIds.stream().map(id -> "?").collect(Collectors.joining(","));
        String sql = "SELECT meeting_id, interest_id FROM meeting_interest WHERE meeting_id IN (" + placeholders + ")";

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, meetingIds.toArray());

        Map<Long, List<Long>> result = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Long meetingId = ((Number) row.get("meeting_id")).longValue();
            Long interestId = ((Number) row.get("interest_id")).longValue();
            result.computeIfAbsent(meetingId, k -> new ArrayList<>()).add(interestId);
        }
        return result;
    }

    public Map<Long, String> findHobbyNamesByIds(List<Long> hobbyIds) {
        if (hobbyIds == null || hobbyIds.isEmpty()) {
            return Map.of();
        }

        String placeholders = hobbyIds.stream()
                .map(id -> "?")
                .collect(Collectors.joining(","));

        String sql = "SELECT id, interest_name FROM interest WHERE id IN (" + placeholders + ")";

        List<Map<String, Object>> rows =
                jdbcTemplate.queryForList(sql, hobbyIds.toArray());

        Map<Long, String> result = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Long id = ((Number) row.get("id")).longValue();
            String name = (String) row.get("interest_name");
            result.put(id, name);
        }
        return result;
    }

    public String findHobbyNameById(Long hobbyId) {
        return jdbcTemplate.queryForObject(
                "SELECT interest_name FROM interest WHERE id = ?",
                String.class,
                hobbyId
        );
    }

    // =========================
    // ✅ 카테고리 기반 추천용
    // =========================

    // 1) 유저가 선택한 취미들의 카테고리 목록
    public List<String> findUserCategoryNamesByUserId(Long userId) {
        String sql = """
            SELECT DISTINCT i.category
            FROM user_interest ui
            JOIN interest i ON ui.interest_id = i.interest_id
            WHERE ui.user_id = ?
              AND i.category IS NOT NULL
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString(1), userId);
    }

    // 2) 카테고리 목록에 해당하는 모임 ID 목록 (한글 이름 → enum 이름 매핑)
    public List<Long> findMeetingIdsByCategories(List<String> categoryNames) {
        log.info("[NEW-DEBUG] findMeetingIdsByCategories 호출됨! categoryNames={}", categoryNames);
        
        if (categoryNames == null || categoryNames.isEmpty()) {
            log.info("[NEW-DEBUG] categoryNames가 비어있음");
            return List.of();
        }

        // 이미 enum 이름이 들어오므로 매핑 불필요
        List<String> enumCategoryNames = categoryNames.stream()
                .filter(Objects::nonNull)
                .filter(name -> !name.isBlank())
                .toList();

        if (enumCategoryNames.isEmpty()) {
            log.info("[NEW-DEBUG] enumCategoryNames가 비어있음");
            return List.of();
        }

        String placeholders = String.join(",", enumCategoryNames.stream().map(x -> "?").toList());
        String sql = "SELECT id FROM meeting WHERE category IN (" + placeholders + ")";
        
        log.info("[NEW-DEBUG] SQL: {}", sql);
        log.info("[NEW-DEBUG] 파라미터: {}", enumCategoryNames);
        
        List<Long> result = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong(1), enumCategoryNames.toArray());
        log.info("[NEW-DEBUG] 결과: {}", result);
        
        return result;
    }

    public List<Long> findAllHobbyIds() {
        return jdbcTemplate.queryForList(
                "SELECT id FROM interest",
                Long.class
        );
    }
}