package com.aidea.backend.domain.recommendation.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MeetingVectorUpsertRepository {

    @Qualifier("vectorJdbc")
    private final NamedParameterJdbcTemplate vectorJdbc;

    public void upsert(Long meetingId, float[] embedding) {
        String sql = """
            INSERT INTO meeting_vector (meeting_id, embedding, updated_at)
            VALUES (:meetingId, (:embedding)::vector, NOW())
            ON CONFLICT (meeting_id)
            DO UPDATE SET embedding = EXCLUDED.embedding,
                         updated_at = NOW()
        """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("meetingId", meetingId)
                .addValue("embedding", toVectorLiteral(embedding));

        vectorJdbc.update(sql, params);
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