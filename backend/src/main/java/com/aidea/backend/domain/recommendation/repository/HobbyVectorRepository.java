package com.aidea.backend.domain.recommendation.repository;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class HobbyVectorRepository {

    private final NamedParameterJdbcTemplate vectorJdbc;

    public HobbyVectorRepository(@Qualifier("vectorJdbc") NamedParameterJdbcTemplate vectorJdbc) {
        this.vectorJdbc = vectorJdbc;
    }

    public List<Long> findSelectedHobbyIdsByNicknameFromMySqlResult(List<Long> selectedIds) {
        // 이 클래스에서는 사용 안 함 (MySQL에서 가져온 selectedIds를 그대로 쓸 것)
        return selectedIds;
    }

    /**
     * 선택된 취미들의 벡터를 평균 내서 user_vector(vector(3))를 만들고,
     * user_vector와 가까운 hobby를 TOP-K로 뽑는다.
     *
     * @param selectedHobbyIds 유저가 이미 선택한 hobby_id들 (MySQL에서 가져온 값)
     */
    public List<Map<String, Object>> findTopHobbiesByUserVector(List<Long> selectedHobbyIds, int k) {
        String sql = """
            WITH selected AS (
              SELECT embedding
              FROM hobby_vector
              WHERE hobby_id = ANY(:selected_ids)
            ),
            avg_vec AS (
              SELECT
                avg((embedding::text::jsonb->>0)::float8) AS a0,
                avg((embedding::text::jsonb->>1)::float8) AS a1,
                avg((embedding::text::jsonb->>2)::float8) AS a2
              FROM selected
            ),
            user_vec AS (
              SELECT ('[' || a0 || ',' || a1 || ',' || a2 || ']')::vector AS v
              FROM avg_vec
            )
            SELECT hv.hobby_id,
                   (hv.embedding <-> (SELECT v FROM user_vec)) AS distance
            FROM hobby_vector hv
            WHERE hv.hobby_id <> ALL(:selected_ids)
            ORDER BY hv.embedding <-> (SELECT v FROM user_vec)
            LIMIT :k
            """;

        return vectorJdbc.queryForList(
                sql,
                Map.of("selected_ids", selectedHobbyIds.toArray(Long[]::new), "k", k)
        );
    }
}