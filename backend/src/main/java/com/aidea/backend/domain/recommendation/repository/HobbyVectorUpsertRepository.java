package com.aidea.backend.domain.recommendation.repository;

import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class HobbyVectorUpsertRepository {

    private final NamedParameterJdbcTemplate vectorJdbc;

    public HobbyVectorUpsertRepository(@Qualifier("vectorJdbc") NamedParameterJdbcTemplate vectorJdbc) {
        this.vectorJdbc = vectorJdbc;
    }

    public void upsert(long hobbyId, float[] embedding) {
        String vectorLiteral = toVectorLiteral(embedding);

        String sql = """
            INSERT INTO hobby_vector (hobby_id, embedding)
            VALUES (:hobbyId, (:embedding)::vector)
            ON CONFLICT (hobby_id)
            DO UPDATE SET embedding = EXCLUDED.embedding
            """;

        vectorJdbc.update(sql, Map.of(
                "hobbyId", hobbyId,
                "embedding", vectorLiteral
        ));
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