package com.aidea.backend.domain.recommendation.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class TitanEmbeddingClient {

    private static final String MODEL_ID = "amazon.titan-embed-text-v2:0";
    private static final int DIMENSIONS = 1024; // ✅ 너희 pgvector 컬럼이 vector(1024)

    private final BedrockRuntimeClient bedrockRuntimeClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.ai.enabled:false}")
    private boolean aiEnabled;

    @Value("${app.ai.embedding.enabled:false}")
    private boolean embeddingEnabled;

    public float[] embedToFloatArray(String inputText) {
        // AI 활성화 확인 (Spring configuration 사용)
        log.info("[AI-EMBEDDING] AI enabled={}, embedding enabled={}", aiEnabled, embeddingEnabled);
        
        if (!aiEnabled || !embeddingEnabled) {
            log.info("[AI-EMBEDDING] AI 기능이 비활성화되어 있습니다. 수학적 벡터를 반환합니다.");
            return createMathVector(inputText);
        }

        try {
            return callTitanAPI(inputText);
        } catch (Exception e) {
            log.error("[AI-EMBEDDING] Titan API 호출 실패, fallback to math vector: {}", e.getMessage());
            return createMathVector(inputText);
        }
    }

    /**
     * Titan API 직접 호출 (주입받은 클라이언트 사용)
     */
    private float[] callTitanAPI(String inputText) throws Exception {
        try {
            // 주입받은 클라이언트 사용
            BedrockRuntimeClient client = this.bedrockRuntimeClient;

            String bodyJson = """
                {
                  "inputText": "%s",
                  "dimensions": %d,
                  "normalize": true
                }
                """.formatted(escapeJson(inputText), DIMENSIONS);

            InvokeModelRequest request = InvokeModelRequest.builder()
                    .modelId(MODEL_ID)
                    .contentType("application/json")
                    .accept("application/json")
                    .body(SdkBytes.fromUtf8String(bodyJson))
                    .build();

            InvokeModelResponse response = client.invokeModel(request);
            String responseJson = response.body().asString(StandardCharsets.UTF_8);

            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode embeddingNode = root.get("embedding");
            if (embeddingNode == null || !embeddingNode.isArray()) {
                throw new IllegalStateException("embedding field not found: " + responseJson);
            }

            float[] vector = new float[embeddingNode.size()];
            for (int i = 0; i < embeddingNode.size(); i++) {
                vector[i] = (float) embeddingNode.get(i).asDouble();
            }

            if (vector.length != DIMENSIONS) {
                throw new IllegalStateException("dimension mismatch. expected=" + DIMENSIONS + ", actual=" + vector.length);
            }

            return vector;

        } catch (Exception e) {
            log.error("[AI-EMBEDDING] Titan API 실패: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Fallback: 수학적 벡터 생성 (AI 없을 때)
     */
    private float[] createMathVector(String inputText) {
        log.info("[AI-EMBEDDING] 수학적 벡터 생성: text=[{}]", 
            inputText.length() > 50 ? inputText.substring(0, 50) + "..." : inputText);
        
        float[] vector = new float[DIMENSIONS];
        
        // 텍스트 해시 기반으로 간단한 벡터 생성
        int hash = inputText.hashCode();
        for (int i = 0; i < DIMENSIONS; i++) {
            vector[i] = (float) ((hash * (i + 1)) % 1000) / 1000.0f;
        }
        
        return vector;
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}