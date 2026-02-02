package com.aidea.backend.domain.event.service;

import com.aidea.backend.domain.event.dto.request.CreateEventRequest;
import com.aidea.backend.domain.event.dto.request.UpdateEventRequest;
import com.aidea.backend.domain.event.dto.response.EventDetailResponse;
import com.aidea.backend.domain.event.entity.Event;
import com.aidea.backend.domain.event.repository.EventRepository;
import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.entity.MeetingMember;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;
    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final com.aidea.backend.domain.event.repository.EventParticipantRepository eventParticipantRepository;
    private final com.aidea.backend.domain.meeting.repository.MeetingMemberRepository meetingMemberRepository; // Need
                                                                                                               // check
                                                                                                               // member
                                                                                                               // status

    /**
     * 일정 목록 조회
     */
    public List<EventDetailResponse> getEvents(Long meetingId, Long userId) {
        return eventRepository.findByMeetingIdOrderByDateAsc(meetingId).stream()
                .map(event -> EventDetailResponse.from(event, userId))
                .collect(Collectors.toList());
    }

    /**
     * 일정 상세 조회
     */
    public EventDetailResponse getEvent(Long meetingId, Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("일정을 찾을 수 없습니다."));

        if (!event.getMeeting().getId().equals(meetingId)) {
            throw new RuntimeException("해당 모임의 일정이 아닙니다.");
        }

        return EventDetailResponse.from(event, userId);
    }

    /**
     * 일정 생성
     */
    @Transactional
    public EventDetailResponse createEvent(Long meetingId, Long userId, CreateEventRequest request) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 유저 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // HOST 권한 체크
        if (!meeting.getCreator().getUserId().equals(userId)) {
            throw new RuntimeException("일정 생성 권한이 없습니다.");
        }

        // 과거 날짜 검증
        if (request.getScheduledAt().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("과거 날짜로 정모를 생성할 수 없습니다.");
        }

        Event event = Event.builder()
                .meeting(meeting)
                .creator(user)
                .title(request.getTitle())
                .date(request.getScheduledAt())
                .locationName(request.getPlaceName())
                .latitude(request.getLocation().getLat())
                .longitude(request.getLocation().getLng())
                .maxParticipants(request.getMaxParticipants())
                .cost(request.getCost())
                .description(request.getNotes())
                .build();

        eventRepository.save(event);

        // ✅ HOST 자동 참석
        com.aidea.backend.domain.event.entity.EventParticipant participant = com.aidea.backend.domain.event.entity.EventParticipant
                .builder()
                .event(event)
                .user(user)
                .build();
        eventParticipantRepository.save(participant);

        // 메모리 상의 연관관계 및 카운트 업데이트 (Response 반영용)
        event.getParticipants().add(participant);
        event.incrementParticipants();

        return EventDetailResponse.from(event, userId);
    }

    /**
     * 일정 수정
     */
    @Transactional
    public EventDetailResponse updateEvent(Long meetingId, Long eventId, Long userId, UpdateEventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("일정을 찾을 수 없습니다."));

        if (!event.getCreator().getUserId().equals(userId)) { // 작성자(보통 Host)만 수정 가능
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        event.update(
                request.getTitle(),
                request.getScheduledAt(),
                request.getPlaceName(),
                request.getLocation() != null ? request.getLocation().getLat() : null,
                request.getLocation() != null ? request.getLocation().getLng() : null,
                request.getMaxParticipants(),
                request.getCost(),
                request.getNotes());

        return EventDetailResponse.from(event, userId);
    }

    /**
     * 일정 삭제
     */
    @Transactional
    public void deleteEvent(Long meetingId, Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("일정을 찾을 수 없습니다."));

        // 작성자 또는 모임장만 삭제 가능
        boolean isCreator = event.getCreator().getUserId().equals(userId);
        boolean isHost = event.getMeeting().getCreator().getUserId().equals(userId);

        if (!isCreator && !isHost) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        // Cascade delete handled by logic or JPA?
        // If entity has OneToMany cascade, deleting event deletes participants.
        // But explicitly deleting is safer if orphanRemoval not fully trusted or simple
        // query.
        // Event entity has: @OneToMany(..., cascade = CascadeType.ALL, orphanRemoval =
        // true)
        // So just deleting event should suffice. But in Plan I wrote "deleteByEventId".
        // Let's rely on JPA cascade for cleaner code.
        eventRepository.delete(event);
    }

    /**
     * 정모 참석
     */
    @Transactional
    public void participateEvent(Long meetingId, Long eventId, Long userId) {
        log.info("=== 정모 참가 요청 시작 ===");
        log.info("요청 정보: meetingId={}, eventId={}, userId={}", meetingId, eventId, userId);

        // 1. 모임 존재 확인
        if (!meetingRepository.existsById(meetingId)) {
            throw new RuntimeException("모임을 찾을 수 없습니다.");
        }

        // 2. 이벤트 조회
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("정모를 찾을 수 없습니다."));
        log.info("이벤트 조회 완료: eventId={}, title={}", event.getId(), event.getTitle());

        // 3. 모임 ID 일치 확인
        if (!event.getMeeting().getId().equals(meetingId)) {
            log.error("모임 ID 불일치: 요청된 meetingId={}, 실제 event의 meetingId={}", meetingId, event.getMeeting().getId());
            throw new RuntimeException("잘못된 접근입니다. 해당 모임의 정모가 아닙니다.");
        }

        // 4. 정원 초과 확인
        int currentCount = event.getParticipants().size();
        log.debug("현재 참가자 수: {}, 최대 참가자 수: {}", currentCount, event.getMaxParticipants());
        if (currentCount >= event.getMaxParticipants()) {
            throw new RuntimeException("정원이 초과되었습니다.");
        }

        // 5. 모임 멤버십 확인 (먼저 체크)
        MeetingMember member = meetingMemberRepository.findByMeetingIdAndUser_UserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("모임 멤버만 참석할 수 있습니다."));
        log.info("멤버십 확인: status={}, role={}", member.getStatus(), member.getRole());

        // APPROVED 멤버 또는 HOST만 정모 참여 가능
        if (member.getStatus() != com.aidea.backend.domain.meeting.entity.enums.MemberStatus.APPROVED) {
            log.warn("미승인 멤버 참가 시도: status={}", member.getStatus());
            throw new RuntimeException("모임 승인된 멤버만 정모에 참석할 수 있습니다.");
        }

        // 6. 중복 참가 확인 (메모리)
        boolean isAlreadyInParticipants = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().getUserId().equals(userId));

        if (isAlreadyInParticipants) {
            log.warn("이미 참석 중인 사용자입니다 (Memory Check): userId={}", userId);
            throw new IllegalStateException("이미 참석 중입니다.");
        }

        // 7. 중복 참가 확인 (DB 상세)
        var existingParticipant = eventParticipantRepository.findByEvent_IdAndUser_UserId(eventId, userId);
        if (existingParticipant.isPresent()) {
            log.warn("이미 참석 중인 사용자입니다 (DB Check): userId={}, participantId={}", userId,
                    existingParticipant.get().getId());
            throw new IllegalStateException("이미 참석 중입니다.");
        }

        User user = userRepository.getReferenceById(userId);

        // 8. 참가 처리
        com.aidea.backend.domain.event.entity.EventParticipant participant = com.aidea.backend.domain.event.entity.EventParticipant
                .builder()
                .event(event)
                .user(user)
                // .status(ParticipantStatus.JOINED) // Status field might not exist or defaults
                // needed
                .build();

        eventParticipantRepository.save(participant);
        log.info("참가 저장 완료: userId={}, eventId={}", userId, eventId);

        // 역방향 관계 업데이트 (JPA 영속성 컨텍스트 동기화)
        event.getParticipants().add(participant);
        log.info("=== 정모 참가 요청 성공적으로 완료 ===");
    }

    /**
     * 정모 참석 취소
     */
    @Transactional
    public void cancelParticipation(Long meetingId, Long eventId, Long userId) {
        log.info("정모 참가 취소 요청: eventId={}, userId={}", eventId, userId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("정모를 찾을 수 없습니다."));

        if (!event.getMeeting().getId().equals(meetingId)) {
            throw new RuntimeException("잘못된 접근입니다.");
        }

        // ... comments ...

        eventParticipantRepository.deleteByEvent_IdAndUser_UserId(eventId, userId);

        // 역방향 관계 업데이트
        boolean removed = event.getParticipants().removeIf(p -> p.getUser().getUserId().equals(userId));
        log.info("참가 취소 완료 (메모리 제거 여부: {})", removed);
    }
}
