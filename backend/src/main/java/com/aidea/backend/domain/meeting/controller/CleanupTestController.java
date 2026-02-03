package com.aidea.backend.domain.meeting.controller;

import com.aidea.backend.domain.meeting.scheduler.MeetingCleanupScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Cleanup 기능 테스트를 위한 임시 컨트롤러
 * (운영 환경에서는 삭제하거나 권한 제한 필요)
 */
@RestController
@RequestMapping("/api/test/cleanup")
@RequiredArgsConstructor
public class CleanupTestController {

    private final MeetingCleanupScheduler cleanupScheduler;

    @PostMapping("/complete")
    public String triggerComplete() {
        cleanupScheduler.completeExpiredMeetings();
        return "Step 1: Expired meetings status updated to COMPLETED";
    }

    @PostMapping("/soft-delete")
    public String triggerSoftDelete() {
        cleanupScheduler.archiveOldData();
        return "Step 2: Old meetings (2 weeks+) soft deleted";
    }

    @PostMapping("/permanent-delete")
    public String triggerPermanentDelete() {
        cleanupScheduler.permanentlyDeleteOldData();
        return "Step 3: Deleted data (1 month+) permanently removed";
    }
}
