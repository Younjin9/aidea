package com.aidea.backend.domain.recommendation.vector;

import com.aidea.backend.domain.ai.service.TitanEmbeddingService;
import com.aidea.backend.domain.recommendation.repository.HobbyVectorUpsertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.vector-seed.enabled", havingValue = "true", matchIfMissing = false)
public class HobbyVectorSeeder implements CommandLineRunner {

    // ✅ MySQL (기존 Spring Boot 기본 datasource)
    private final JdbcTemplate jdbcTemplate;

    // ✅ Postgres(pgvector)용 NamedParameterJdbcTemplate (확장/테이블 보장용)
    @Qualifier("vectorJdbc")
    private final NamedParameterJdbcTemplate vectorJdbc;

    // ✅ Titan 임베딩 생성
    private final TitanEmbeddingService titanEmbeddingService;

    // ✅ hobby_vector upsert (저장용)
    private final HobbyVectorUpsertRepository hobbyVectorUpsertRepository;

    @Override
    public void run(String... args) {
        try {
            // 1) MySQL interest 목록 조회
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT interest_id, interest_name FROM interest"
            );

            if (rows.isEmpty()) {
                log.warn("[VECTOR-SEED] MySQL interest table is empty. Skip seeding.");
                return;
            }

            // 2) Postgres 확장/테이블 보장 (✅ Titan은 1024차원)
            vectorJdbc.getJdbcTemplate().execute("CREATE EXTENSION IF NOT EXISTS vector");
            vectorJdbc.getJdbcTemplate().execute("""
                CREATE TABLE IF NOT EXISTS hobby_vector (
                  hobby_id BIGINT PRIMARY KEY,
                  embedding vector(1024) NOT NULL
                )
            """);

            int insertedOrUpdated = 0;
            int skipped = 0;

            // 3) MySQL interest_name -> Titan 임베딩(1024) -> Postgres UPSERT
            for (Map<String, Object> row : rows) {
                Long hobbyId = ((Number) row.get("interest_id")).longValue();

                String hobbyNameRaw = (String) row.get("interest_name");
                String hobbyName = (hobbyNameRaw == null) ? null : hobbyNameRaw.trim();

                if (hobbyName == null || hobbyName.isBlank()) {
                    skipped++;
                    log.warn("[VECTOR-SEED] skip empty interest_name. hobbyId={}", hobbyId);
                    continue;
                }

                // ✅ Titan 임베딩 생성 (1024차원)
                float[] embedding = titanEmbeddingService.embed(hobbyName);

                // ✅ Postgres hobby_vector upsert
                hobbyVectorUpsertRepository.upsert(hobbyId, embedding);

                insertedOrUpdated++;
            }

            log.info("[VECTOR-SEED] done. insertedOrUpdated={}, skipped={}", insertedOrUpdated, skipped);

        } catch (Exception e) {
            // seed 실패해도 서버는 떠야 하니까 warn 정도로만
            log.warn("[VECTOR-SEED] failed: {}", e.getMessage(), e);
        }
    }
}