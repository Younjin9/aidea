package com.aidea.backend.domain.recommendation.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class HobbyVectorRepository {

    private final NamedParameterJdbcTemplate vectorJdbc;

    public HobbyVectorRepository(@Qualifier("vectorJdbc") NamedParameterJdbcTemplate vectorJdbc) {
        this.vectorJdbc = vectorJdbc;
    }

    /**
     * (기존 코드 유지용) 이 클래스에서는 MySQL 조회는 안 하고,
     * Service에서 받은 selectedIds를 그대로 쓸 예정이라 그냥 반환.
     */
    public List<Long> findSelectedHobbyIdsByNicknameFromMySqlResult(List<Long> selectedIds) {
        return selectedIds;
    }

    /**
     * ✅ [추가] hobby_id 목록으로 embedding(vector)을 조회한다.
     * - 반환: hobby_id -> float[] embedding
     */
    public Map<Long, float[]> findEmbeddingsByHobbyIds(List<Long> hobbyIds) {
        if (hobbyIds == null || hobbyIds.isEmpty()) {
            return Map.of();
        }

        String sql = """
            SELECT hobby_id, embedding::text AS embedding_text
            FROM hobby_vector
            WHERE hobby_id IN (:ids)
        """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("ids", hobbyIds);

        List<Map<String, Object>> rows = vectorJdbc.queryForList(sql, params);

        // hobby_id -> float[]
        var result = new java.util.HashMap<Long, float[]>(rows.size());
        for (Map<String, Object> row : rows) {
            Long hobbyId = ((Number) row.get("hobby_id")).longValue();
            String embeddingText = (String) row.get("embedding_text"); // "[0.1,0.2,...]"
            result.put(hobbyId, parseVectorStringToFloatArray(embeddingText));
        }
        return result;
    }

    /**
     * ✅ 선택된 취미들의 벡터를 평균 내서 user_vector를 만들고,
     * user_vector와 가까운 hobby를 TOP-K로 뽑는다.
     *
     * @param selectedHobbyIds 유저가 이미 선택한 hobby_id들
     * @param k TOP-K
     * @return List<Map<String,Object>> (hobby_id, distance)
     */
    public List<Map<String, Object>> findTopHobbiesByUserVector(List<Long> selectedHobbyIds, int k) {
        if (selectedHobbyIds == null || selectedHobbyIds.isEmpty()) {
            return List.of();
        }

        // 1) 선택 취미들의 embedding을 한 번에 조회
        Map<Long, float[]> embeddingMap = findEmbeddingsByHobbyIds(selectedHobbyIds);
        if (embeddingMap.isEmpty()) {
            return List.of();
        }

        // 2) 유저 벡터 = 선택된 취미 벡터 평균
        float[] userVector = average(new ArrayList<>(embeddingMap.values()));
        if (userVector == null || userVector.length == 0) {
            return List.of();
        }

        // 3) pgvector literal로 변환 (예: [0.1,0.2,...])
        String userVecLiteral = toPgVectorLiteral(userVector);

        // 4) 유사 취미 TOP-K 검색 (선택 취미는 제외)
        String sql = """
            SELECT hv.hobby_id,
                   (hv.embedding <-> (:user_vec)::vector) AS distance
            FROM hobby_vector hv
            WHERE hv.hobby_id NOT IN (:selected_ids)
            ORDER BY hv.embedding <-> (:user_vec)::vector
            LIMIT :k
        """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("selected_ids", selectedHobbyIds)
                .addValue("user_vec", userVecLiteral)
                .addValue("k", k);

        return vectorJdbc.queryForList(sql, params);
    }

    // -------------------------
    // 내부 유틸
    // -------------------------

    private float[] average(List<float[]> vectors) {
        if (vectors == null || vectors.isEmpty()) return null;

        int dim = vectors.get(0).length;
        float[] avg = new float[dim];

        int count = 0;
        for (float[] v : vectors) {
            if (v == null || v.length != dim) continue;
            for (int i = 0; i < dim; i++) {
                avg[i] += v[i];
            }
            count++;
        }

        if (count == 0) return null;

        for (int i = 0; i < dim; i++) {
            avg[i] /= count;
        }
        return avg;
    }

    private String toPgVectorLiteral(float[] vector) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(vector[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * postgres vector::text 형태인 "[0.1,0.2,...]" 문자열을 float[]로 파싱
     */
    private float[] parseVectorStringToFloatArray(String s) {
        if (s == null || s.isBlank()) return new float[0];

        String trimmed = s.trim();
        if (trimmed.startsWith("[")) trimmed = trimmed.substring(1);
        if (trimmed.endsWith("]")) trimmed = trimmed.substring(0, trimmed.length() - 1);
        if (trimmed.isBlank()) return new float[0];

        String[] parts = trimmed.split(",");
        float[] v = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            v[i] = Float.parseFloat(parts[i].trim());
        }
        return v;
    }
}