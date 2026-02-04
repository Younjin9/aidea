package com.aidea.backend.domain.recommendation.controller;

import com.aidea.backend.domain.recommendation.vector.VectorStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 🔧 벡터 저장소 관리 API
 * - 원래 설계대로 벡터 시딩 및 관리
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/vector-storage")
@RequiredArgsConstructor
public class VectorStorageController {

    private final VectorStorageService vectorStorage;

    /**
     * ✅ 벡터 저장소 상태 확인
     */
    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Integer> status = vectorStorage.getVectorStorageStatus();
        
        return Map.of(
            "status", "success",
            "message", "벡터 저장소 상태",
            "data", Map.of(
                "meetingVectors", status.get("meetingVectors"),
                "userVectors", status.get("userVectors"),
                "totalStored", status.get("meetingVectors") + status.get("userVectors")
            )
        );
    }

    /**
     * ✅ 모든 모임 벡터 시딩
     */
    @PostMapping("/seed-meetings")
    public Map<String, Object> seedMeetingVectors() {
        try {
            vectorStorage.seedAllMeetingVectors();
            
            return Map.of(
                "status", "success",
                "message", "모든 모임 벡터 시딩 완료"
            );
        } catch (Exception e) {
            log.error("[VECTOR-API] 모임 벡터 시딩 실패: {}", e.getMessage());
            
            return Map.of(
                "status", "error",
                "message", "모임 벡터 시딩 실패: " + e.getMessage()
            );
        }
    }

    /**
     * ✅ 모든 사용자 벡터 시딩
     */
    @PostMapping("/seed-users")
    public Map<String, Object> seedUserVectors() {
        try {
            vectorStorage.seedAllUserVectors();
            
            return Map.of(
                "status", "success",
                "message", "모든 사용자 벡터 시딩 완료"
            );
        } catch (Exception e) {
            log.error("[VECTOR-API] 사용자 벡터 시딩 실패: {}", e.getMessage());
            
            return Map.of(
                "status", "error",
                "message", "사용자 벡터 시딩 실패: " + e.getMessage()
            );
        }
    }

    /**
     * ✅ 전체 벡터 시딩 (모임 + 사용자)
     */
    @PostMapping("/seed-all")
    public Map<String, Object> seedAllVectors() {
        try {
            vectorStorage.seedAllUserVectors();
            vectorStorage.seedAllMeetingVectors();
            
            Map<String, Integer> finalStatus = vectorStorage.getVectorStorageStatus();
            
            return Map.of(
                "status", "success",
                "message", "전체 벡터 시딩 완료",
                "data", Map.of(
                    "meetingVectors", finalStatus.get("meetingVectors"),
                    "userVectors", finalStatus.get("userVectors"),
                    "totalStored", finalStatus.get("meetingVectors") + finalStatus.get("userVectors")
                )
            );
        } catch (Exception e) {
            log.error("[VECTOR-API] 전체 벡터 시딩 실패: {}", e.getMessage());
            
            return Map.of(
                "status", "error", 
                "message", "전체 벡터 시딩 실패: " + e.getMessage()
            );
        }
    }
}