package com.aidea.backend.domain.ai.controller;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class EmbeddingTestController {

    private final EmbeddingModel embeddingModel;

    public EmbeddingTestController(
            @Qualifier("titanEmbeddingModel") EmbeddingModel embeddingModel
    ) {
        this.embeddingModel = embeddingModel;
    }

    @GetMapping("/ai/embedding-test")
    public Map<String, Object> test(@RequestParam(defaultValue = "보드게임 좋아해요") String text) {
        EmbeddingResponse res = embeddingModel.embedForResponse(List.of(text));

        int dim = res.getResults().get(0).getOutput().length;

        return Map.of(
                "text", text,
                "dimension", dim
        );
    }
}