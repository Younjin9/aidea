package com.aidea.backend.domain.recommendation.controller;

import com.aidea.backend.domain.recommendation.ai.MeetingVectorSyncService;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Profile("local")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/vector")
public class MeetingVectorAdminController {

    private final MeetingVectorSyncService meetingVectorSyncService;
    private final MeetingRepository meetingRepository;

    @PostMapping("/meetings/{meetingId}/sync")
    public ResponseEntity<String> syncOne(@PathVariable Long meetingId) {
        meetingVectorSyncService.syncOne(meetingId);
        return ResponseEntity.ok("OK - synced meetingId=" + meetingId);
    }

    @PostMapping("/meetings/sync-all")
    public ResponseEntity<String> syncAll() {
        // meetingRepository.findAll()이 부담되면 나중에 ids만 뽑는 쿼리로 교체 가능
        List<Long> ids = meetingRepository.findAll().stream().map(m -> m.getId()).toList();
        for (Long id : ids) {
            meetingVectorSyncService.syncOne(id);
        }
        return ResponseEntity.ok("OK - synced meeting count=" + ids.size());
    }
}