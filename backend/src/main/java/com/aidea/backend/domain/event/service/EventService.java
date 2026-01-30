package com.aidea.backend.domain.event.service;

import com.aidea.backend.domain.event.dto.request.CreateEventRequest;
import com.aidea.backend.domain.event.dto.request.UpdateEventRequest;
import com.aidea.backend.domain.event.dto.response.EventDetailResponse;
import com.aidea.backend.domain.event.entity.Event;
import com.aidea.backend.domain.event.repository.EventRepository;
import com.aidea.backend.domain.meeting.entity.Meeting;
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
        log.info("정모 참가 요청 시작: meetingId={}, eventId={}, userId={}", meetingId, eventId, userId);

        if (!meetingRepository.existsById(meetingId)) {
            throw new RuntimeException("모임을 찾을 수 없습니다.");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("정모를 찾을 수 없습니다."));

        // URL의 meetingId와 이벤트의 meetingId가 일치하는지 검증
        if (!event.getMeeting().getId().equals(meetingId)) {
            log.error("모임 ID 불일치: 요청된 meetingId={}, 실제 event의 meetingId={}", meetingId, event.getMeeting().getId());
            throw new RuntimeException("잘못된 접근입니다. 해당 모임의 정모가 아닙니다.");
        }

        // 정원 초과 확인
        int currentCount = event.getParticipants().size();
        log.debug("현재 참가자 수: {}, 최대 참가자 수: {}", currentCount, event.getMaxParticipants());
        if (currentCount >= event.getMaxParticipants()) {
            throw new RuntimeException("정원이 초과되었습니다.");
        }

        // 이미 참석 중인지 확인
        boolean isAlreadyParticipating = eventParticipantRepository.existsByEvent_IdAndUser_UserId(eventId, userId);
        log.info("참가 상태 확인 결과: eventId={}, userId={}, isParticipating={}", eventId, userId, isAlreadyParticipating);

        if (isAlreadyParticipating) {
            log.warn("이미 참석 중인 사용자입니다: userId={}", userId);
            throw new RuntimeException("이미 참석 중입니다.");
        }

        // 모임 멤버인지 확인
        boolean isMember = meetingMemberRepository.existsByMeetingIdAndUser_UserIdAndStatusNot(meetingId, userId,
                com.aidea.backend.domain.meeting.entity.enums.MemberStatus.LEFT);
        if (!isMember) {
            log.warn("모임 멤버가 아닌 사용자가 정모 참여 시도: meetingId={}, userId={}", meetingId, userId);
            throw new RuntimeException("모임 멤버만 참석할 수 있습니다.");
        }

        // APPROVE check? Typically only APPROVED members can join events.
        // Let's check status APPROVED.
        var member = meetingMemberRepository.findByMeetingIdAndUser_UserId(meetingId, userId);
        if (member.isEmpty()
                || member.get().getStatus() != com.aidea.backend.domain.meeting.entity.enums.MemberStatus.APPROVED) {
            throw new RuntimeException("모임 승인된 멤버만 참석할 수 있습니다.");
        }

        User user = userRepository.getReferenceById(userId);

        com.aidea.backend.domain.event.entity.EventParticipant participant = com.aidea.backend.domain.event.entity.EventParticipant
                .builder()
                .event(event)
                .user(user)
                .build();

        eventParticipantRepository.save(participant);

        // 역방향 관계 업데이트 (JPA 영속성 컨텍스트 동기화)
        event.getParticipants().add(participant);
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
