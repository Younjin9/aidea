package com.aidea.backend.domain.meeting.scheduler;

import com.aidea.backend.domain.chat.repository.ChatMessageRepository;
import com.aidea.backend.domain.chat.repository.ChatRoomRepository;
import com.aidea.backend.domain.event.repository.EventParticipantRepository;
import com.aidea.backend.domain.event.repository.EventRepository;
import com.aidea.backend.domain.meeting.repository.MeetingLikeRepository;
import com.aidea.backend.domain.meeting.repository.MeetingMemberRepository;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.meeting.repository.MeetingShareRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 정모/모임 단계별 정리 스케줄러
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MeetingCleanupScheduler {

    private final MeetingRepository meetingRepository;
    private final EventRepository eventRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final MeetingMemberRepository meetingMemberRepository;
    private final MeetingLikeRepository meetingLikeRepository;
    private final MeetingShareRepository meetingShareRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    /**
     * [STEP 1] 매일 새벽 3시: 완료 처리
     * - 날짜가 1일 이상 지난 모임 상태를 COMPLETED로 변경
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void completeExpiredMeetings() {
        log.info("[Cleanup STEP 1] 일정이 지난 모임 완료 처리 시작...");
        try {
            LocalDateTime threshold = LocalDateTime.now().minusDays(1);
            meetingRepository.updateStatusToCompleted(threshold);
            log.info("[Cleanup STEP 1] 완료 처리 성공");
        } catch (Exception e) {
            log.error("[Cleanup STEP 1] 완료 처리 중 오류 발생", e);
        }
    }

    /**
     * [STEP 2] 매주 일요일 새벽 4시: Soft Delete (보관)
     * - 종료된 지 2주일이 지난 데이터를 사용자 화면에서 제외
     */
    @Scheduled(cron = "0 0 4 * * SUN")
    @Transactional
    public void archiveOldData() {
        log.info("[Cleanup STEP 2] 오래된 모임/정모 Soft Delete 시작...");
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime threshold = now.minusWeeks(2);

            meetingRepository.markAsDeleted(threshold, now);
            eventRepository.markAsDeleted(threshold, now);

            log.info("[Cleanup STEP 2] Soft Delete 성공");
        } catch (Exception e) {
            log.error("[Cleanup STEP 2] Soft Delete 중 오류 발생", e);
        }
    }

    /**
     * [STEP 3] 매월 1일 새벽 5시: 물리 삭제
     * - Soft Delete 후 1개월이 지난 데이터 영구 삭제
     */
    @Scheduled(cron = "0 0 5 1 * *")
    @Transactional
    public void permanentlyDeleteOldData() {
        log.info("[Cleanup STEP 3] 오래된 Soft Delete 데이터 물리 삭제 시작...");
        try {
            LocalDateTime threshold = LocalDateTime.now().minusMonths(1);

            // 1. 독립적인 '정모' 삭제 (모임은 살아있지만 정모만 삭제된 경우)
            List<Long> eventIds = eventRepository.findIdsByDeletedAtBefore(threshold);
            if (!eventIds.isEmpty()) {
                log.info("[Cleanup STEP 3] 독립 정모 삭제 진행: {}건", eventIds.size());
                eventParticipantRepository.deleteByEventIdIn(eventIds);
                eventRepository.deleteByIdIn(eventIds);
            }

            // 2. '모임' 및 관련 전체 데이터 삭제
            List<Long> meetingIds = meetingRepository.findIdsByDeletedAtBefore(threshold);

            if (meetingIds.isEmpty()) {
                log.info("[Cleanup STEP 3] 삭제 대상 모임 데이터 없음");
                return;
            }

            log.info("[Cleanup STEP 3] 총 {}건의 모임 및 연관 데이터 영구 삭제 진행", meetingIds.size());

            // 2-1. 채팅 메시지 & 채팅방
            List<Long> chatRoomIds = chatRoomRepository.findIdsByMeetingIdIn(meetingIds);
            if (!chatRoomIds.isEmpty()) {
                chatMessageRepository.deleteByChatRoomIdIn(chatRoomIds);
                chatRoomRepository.deleteByMeetingIdIn(meetingIds);
            }

            // 2-2. 정모 참여자 & 정모 (남아있는 것들)
            eventParticipantRepository.deleteByMeetingIdIn(meetingIds);
            eventRepository.deleteByMeetingIdIn(meetingIds);

            // 2-3. 모임 멤버 & 찜 & 공유 링크
            meetingMemberRepository.deleteByMeetingIdIn(meetingIds);
            meetingLikeRepository.deleteByMeetingIdIn(meetingIds);
            meetingShareRepository.deleteByMeetingIdIn(meetingIds);

            // 3. 최종 모임 삭제
            meetingRepository.deleteByIdIn(meetingIds);

            log.info("[Cleanup STEP 3] 물리 삭제 성공: 모임 {}건", meetingIds.size());
        } catch (Exception e) {
            log.error("[Cleanup STEP 3] 물리 삭제 중 오류 발생", e);
            throw e;
        }
    }
}
