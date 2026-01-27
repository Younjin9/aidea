package com.aidea.backend.domain.recommendation.repository;

import java.util.List;

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
}