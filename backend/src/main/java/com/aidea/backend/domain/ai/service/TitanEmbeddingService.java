package com.aidea.backend.domain.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class TitanEmbeddingService {

    private static final String MODEL_ID = "amazon.titan-embed-text-v2:0";
    private static final int DIMENSIONS = 1024;     // ✅ DB vector(1024)와 맞춤
    private static final boolean NORMALIZE = true;

    private final BedrockRuntimeClient bedrockRuntimeClient;
    private final ObjectMapper objectMapper;

    /**
     * 입력 텍스트 1개를 Titan v2 임베딩(float[])으로 변환한다.
     */
    public float[] embed(String inputText) {
        try {
            String bodyJson = """
                    {
                      "inputText": "%s",
                      "dimensions": %d,
                      "normalize": %s
                    }
                    """.formatted(escapeJson(inputText), DIMENSIONS, NORMALIZE);

            InvokeModelRequest request = InvokeModelRequest.builder()
                    .modelId(MODEL_ID)
                    .contentType("application/json")
                    .accept("application/json")
                    .body(SdkBytes.fromUtf8String(bodyJson))
                    .build();

            InvokeModelResponse response = bedrockRuntimeClient.invokeModel(request);
            String responseBody = response.body().asString(StandardCharsets.UTF_8);

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode embeddingNode = root.get("embedding");

            if (embeddingNode == null || !embeddingNode.isArray()) {
                throw new IllegalStateException("Titan embedding response does not contain 'embedding' array. body=" + responseBody);
            }

            float[] vector = new float[embeddingNode.size()];
            for (int i = 0; i < embeddingNode.size(); i++) {
                vector[i] = (float) embeddingNode.get(i).asDouble();
            }
            return vector;

        } catch (Exception e) {
            throw new RuntimeException("Titan v2 embedding failed: " + e.getMessage(), e);
        }
    }

    /**
     * JSON 문자열에 들어갈 텍스트 escape 처리
     */
    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}