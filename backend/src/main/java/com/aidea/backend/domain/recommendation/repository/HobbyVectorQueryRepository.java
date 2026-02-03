package com.aidea.backend.domain.recommendation.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ✅ Vector 후보 취미 TopK를 뽑는 Repository
 * 현재는 "사용자가 선택한 취미"를 TopK로 제한해서 반환하는 기본 버전(컴파일/실행용)
 *
 * TODO: 이후 pgvector/hobby_vector 유사도 검색으로 고도화
 */
@Repository
@RequiredArgsConstructor
public class HobbyVectorQueryRepository {

    private final JdbcTemplate jdbcTemplate;

    /**
     * ✅ 컴파일 에러 해결용 (기본 구현)
     * - user_hobby에서 사용자가 선택한 취미를 가져오고
     * - topK만큼 잘라서 반환
     */
    public List<Long> findTopKHobbyIdsByUserId(Long userId, int topK) {
        String sql = """
            SELECT hobby_id
            FROM user_hobby
            WHERE user_id = ?
            LIMIT ?
        """;
        return jdbcTemplate.queryForList(sql, Long.class, userId, topK);
    }
}