package com.aidea.backend.domain.meeting.scheduler;

import com.aidea.backend.domain.meeting.repository.MeetingShareRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShareCleanupScheduler {

    private final MeetingShareRepository meetingShareRepository;

    // 매일 새벽 4시에 실행
    @Scheduled(cron = "0 0 4 * * *")
    @Transactional
    public void cleanExpiredShares() {
        log.info("만료된 공유 링크 정리 시작...");
        try {
            meetingShareRepository.deleteByExpiresAtBefore(LocalDateTime.now());
            log.info("만료된 공유 링크 정리 완료");
        } catch (Exception e) {
            log.error("만료된 공유 링크 정리 중 오류 발생", e);
        }
    }
}
