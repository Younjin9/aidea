package com.aidea.backend.domain.recommendation.controller;

import com.aidea.backend.domain.recommendation.ai.HobbyVectorSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Profile("local")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/vector")
public class HobbyVectorAdminController {

    private final HobbyVectorSyncService hobbyVectorSyncService;

    /** 취미 1개만 임베딩 다시 생성해서 pgvector에 반영 */
    @PostMapping("/hobbies/{hobbyId}/sync")
    public ResponseEntity<String> syncOne(@PathVariable Long hobbyId) {
        hobbyVectorSyncService.syncOne(hobbyId);
        return ResponseEntity.ok("OK - synced hobbyId=" + hobbyId);
    }

    /** 취미 전체 임베딩 다시 생성해서 pgvector에 반영 */
    @PostMapping("/hobbies/sync-all")
    public ResponseEntity<String> syncAll() {
        int ok = hobbyVectorSyncService.syncAll();
        return ResponseEntity.ok("OK - synced count=" + ok);
    }
}