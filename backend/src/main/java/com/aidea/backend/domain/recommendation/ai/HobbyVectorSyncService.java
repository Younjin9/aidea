package com.aidea.backend.domain.recommendation.ai;

import com.aidea.backend.domain.recommendation.repository.HobbyVectorUpsertRepository;
import com.aidea.backend.domain.recommendation.repository.MySqlRecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HobbyVectorSyncService {

    private final TitanEmbeddingClient titanEmbeddingClient;
    private final HobbyVectorUpsertRepository hobbyVectorUpsertRepository;
    private final MySqlRecommendationRepository mySqlRepo;

    /** hobbyId 1개를 Titan으로 임베딩 생성해서 pgvector에 upsert */
    public void syncOne(Long hobbyId) {
        String hobbyName = mySqlRepo.findHobbyNameById(hobbyId);
        if (hobbyName == null || hobbyName.isBlank()) {
            throw new IllegalArgumentException("hobby not found or empty: " + hobbyId);
        }

        float[] embedding = titanEmbeddingClient.embedToFloatArray(hobbyName);
        hobbyVectorUpsertRepository.upsert(hobbyId, embedding);

        log.info("[HOBBY-VECTOR-SYNC] synced hobbyId={}, hobbyName={}, dim={}",
                hobbyId, hobbyName, embedding.length);
    }

    /** hobby 전체를 순회하면서 pgvector에 upsert (Seeder 대신, 필요할 때 호출) */
    public int syncAll() {
        List<Long> hobbyIds = mySqlRepo.findAllHobbyIds();
        int ok = 0;

        for (Long hobbyId : hobbyIds) {
            try {
                syncOne(hobbyId);
                ok++;
                if (ok % 10 == 0) {
                    log.info("[HOBBY-VECTOR-SYNC] progress {}/{}", ok, hobbyIds.size());
                }
            } catch (Exception e) {
                log.warn("[HOBBY-VECTOR-SYNC] failed hobbyId={} err={}", hobbyId, e.getMessage());
            }
        }

        log.info("[HOBBY-VECTOR-SYNC] done. success={}/{}", ok, hobbyIds.size());
        return ok;
    }
}