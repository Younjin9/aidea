package com.aidea.backend.domain.recommendation.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

import java.nio.charset.StandardCharsets;

@Component
public class TitanEmbeddingClient {

    private static final String MODEL_ID = "amazon.titan-embed-text-v2:0";
    private static final int DIMENSIONS = 1024; // ✅ 너희 pgvector 컬럼이 vector(1024)

    private final ObjectMapper objectMapper = new ObjectMapper();

    public float[] embedToFloatArray(String inputText) {
        try (BedrockRuntimeClient client = BedrockRuntimeClient.builder()
                .region(Region.of(System.getenv().getOrDefault("AWS_REGION", "ap-northeast-2")))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build()) {

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
            throw new RuntimeException("Titan embedding failed", e);
        }
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