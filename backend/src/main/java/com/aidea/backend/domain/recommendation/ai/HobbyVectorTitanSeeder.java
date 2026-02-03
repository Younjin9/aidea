package com.aidea.backend.domain.recommendation.ai;

import com.aidea.backend.domain.recommendation.repository.HobbyVectorUpsertRepository;
import com.aidea.backend.domain.recommendation.repository.MySqlRecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class HobbyVectorTitanSeeder implements CommandLineRunner {

    private final TitanEmbeddingClient titanEmbeddingClient;
    private final HobbyVectorUpsertRepository hobbyVectorUpsertRepository;
    private final MySqlRecommendationRepository mySqlRepo;

    @Override
    public void run(String... args) {
        // ✅ 서버 뜰 때마다 돌리면 비용/시간 커짐 → 플래그 있을 때만 실행
        String flag = System.getenv().getOrDefault("SEED_HOBBY_VECTORS", "false");
        if (!"true".equalsIgnoreCase(flag)) {
            log.info("[SEED] skip (SEED_HOBBY_VECTORS!=true)");
            return;
        }

        Map<Long, String> hobbyMap = mySqlRepo.findHobbyNamesByIds(mySqlRepo.findAllHobbyIds());
        log.info("[SEED] hobby count={}", hobbyMap.size());

        int ok = 0;
        for (var e : hobbyMap.entrySet()) {
            long hobbyId = e.getKey();
            String hobbyName = e.getValue();

            // 임베딩 텍스트(일단 이름만) — 나중에 설명/카테고리 붙여도 됨
            String text = hobbyName;

            float[] embedding = titanEmbeddingClient.embedToFloatArray(text);
            hobbyVectorUpsertRepository.upsert(hobbyId, embedding);

            ok++;
            if (ok % 10 == 0) {
                log.info("[SEED] progress {}/{}", ok, hobbyMap.size());
            }
        }

        log.info("[SEED] done. upserted={}", ok);
    }
}