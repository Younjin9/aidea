package com.aidea.backend.domain.recommendation.repository;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class MySqlRecommendationRepository {

    private final JdbcTemplate jdbcTemplate;

    public MySqlRecommendationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long findUserIdByNickname(String nickname) {
        return jdbcTemplate.queryForObject(
                "SELECT id FROM app_user WHERE nickname = ?",
                Long.class,
                nickname
        );
    }

    public List<Long> findSelectedHobbyIdsByUserId(Long userId) {
        return jdbcTemplate.queryForList(
                "SELECT hobby_id FROM user_hobby WHERE user_id = ?",
                Long.class,
                userId
        );
    }

    public List<Long> findMeetingIdsByHobbyIds(List<Long> hobbyIds) {
        // meeting_hobby(meeting_id, hobby_id) 가정
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
}