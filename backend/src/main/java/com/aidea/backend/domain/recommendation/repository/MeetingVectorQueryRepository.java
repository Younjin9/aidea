package com.aidea.backend.domain.recommendation.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MeetingVectorQueryRepository {

    @Qualifier("vectorJdbc")
    private final NamedParameterJdbcTemplate vectorJdbc;

    /** 유저 벡터와 가까운 meeting_id를 TopK 반환 (cosine distance 기반) */
    public List<Long> findTopKMeetingIds(float[] userEmbedding, int topK) {
        String sql = """
            SELECT meeting_id
            FROM meeting_vector
            ORDER BY embedding <=> (:userEmbedding)::vector
            LIMIT :topK
        """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("userEmbedding", toVectorLiteral(userEmbedding))
                .addValue("topK", topK);

        return vectorJdbc.queryForList(sql, params, Long.class);
    }

    private String toVectorLiteral(float[] arr) {
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(arr[i]);
        }
        sb.append(']');
        return sb.toString();
    }
}