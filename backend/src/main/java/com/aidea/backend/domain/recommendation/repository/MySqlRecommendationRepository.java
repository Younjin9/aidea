package com.aidea.backend.domain.recommendation.repository;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class MySqlRecommendationRepository {

    private final JdbcTemplate jdbcTemplate;

    public MySqlRecommendationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ✅ (기존) nickname 기반 조회 - 혹시 다른 곳에서 쓰면 유지
    public Long findUserIdByNickname(String nickname) {
        return jdbcTemplate.queryForObject(
                "SELECT id FROM app_user WHERE nickname = ?",
                Long.class,
                nickname
        );
    }

    // ✅ (신규) email 기반 조회 - 정식 해결에서 사용
    public Optional<Long> findUserIdByEmail(String email) {
        String sql = "SELECT id FROM app_user WHERE email = ? LIMIT 1";
        return jdbcTemplate.query(sql, rs -> {
            if (rs.next()) return Optional.of(rs.getLong("id"));
            return Optional.empty();
        }, email);
    }

    public List<Long> findSelectedHobbyIdsByUserId(Long userId) {
        return jdbcTemplate.queryForList(
                "SELECT hobby_id FROM user_hobby WHERE user_id = ?",
                Long.class,
                userId
        );
    }

    public List<Long> findMeetingIdsByHobbyIds(List<Long> hobbyIds) {
        String inSql = String.join(",", hobbyIds.stream().map(x -> "?").toList());
        String sql = "SELECT DISTINCT meeting_id FROM meeting_hobby WHERE hobby_id IN (" + inSql + ")";
        return jdbcTemplate.queryForList(sql, Long.class, hobbyIds.toArray());
    }

    public Map<Long, List<Long>> findHobbyIdsGroupedByMeetingIds(List<Long> meetingIds) {
        if (meetingIds == null || meetingIds.isEmpty()) {
            return Map.of();
        }

        String placeholders = meetingIds.stream().map(id -> "?").collect(Collectors.joining(","));
        String sql = "SELECT meeting_id, hobby_id FROM meeting_hobby WHERE meeting_id IN (" + placeholders + ")";

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, meetingIds.toArray());

        Map<Long, List<Long>> result = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Long meetingId = ((Number) row.get("meeting_id")).longValue();
            Long hobbyId = ((Number) row.get("hobby_id")).longValue();
            result.computeIfAbsent(meetingId, k -> new ArrayList<>()).add(hobbyId);
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

        String sql = "SELECT id, hobby_name FROM hobby WHERE id IN (" + placeholders + ")";

        List<Map<String, Object>> rows =
                jdbcTemplate.queryForList(sql, hobbyIds.toArray());

        Map<Long, String> result = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Long id = ((Number) row.get("id")).longValue();
            String name = (String) row.get("hobby_name");
            result.put(id, name);
        }
        return result;
    }

    public Map<Long, String> findAllHobbiesAsMap() {
        String sql = "SELECT id, hobby_name FROM hobby";
        return jdbcTemplate.query(sql, rs -> {
            Map<Long, String> map = new java.util.HashMap<>();
            while (rs.next()) {
                map.put(rs.getLong("id"), rs.getString("hobby_name"));
            }
            return map;
        });
    }

    public String findHobbyNameById(Long hobbyId) {
        return jdbcTemplate.queryForObject(
                "SELECT hobby_name FROM hobby WHERE id = ?",
                String.class,
                hobbyId
        );
    }

    public List<Long> findAllHobbyIds() {
        return jdbcTemplate.queryForList(
                "SELECT id FROM hobby",
                Long.class
        );
    }

    // =========================
    // ✅ 카테고리 기반 추천용
    // =========================

    // 1) 유저가 선택한 취미들의 카테고리 목록
    public List<String> findUserCategoryNamesByUserId(Long userId) {
        String sql = """
            SELECT DISTINCT h.category
            FROM user_hobby uh
            JOIN hobby h ON uh.hobby_id = h.id
            WHERE uh.user_id = ?
              AND h.category IS NOT NULL
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString(1), userId);
    }

    // 2) 카테고리 목록에 해당하는 모임 ID 목록
    public List<Long> findMeetingIdsByCategories(List<String> categoryNames) {
        if (categoryNames == null || categoryNames.isEmpty()) {
            return List.of();
        }

        String placeholders = String.join(",", categoryNames.stream().map(x -> "?").toList());
        String sql = "SELECT id FROM meeting WHERE category IN (" + placeholders + ")";

        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong(1), categoryNames.toArray());
    }
}