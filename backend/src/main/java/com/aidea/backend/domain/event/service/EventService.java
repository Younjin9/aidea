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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("정모를 찾을 수 없습니다."));

        // 정원 초과 확인
        if (event.getParticipants().size() >= event.getMaxParticipants()) {
            throw new RuntimeException("정원이 초과되었습니다.");
        }

        // 이미 참석 중인지 확인
        if (eventParticipantRepository.existsByEventIdAndUser_UserId(eventId, userId)) {
            throw new RuntimeException("이미 참석 중입니다.");
        }

        // 모임 멤버인지 확인
        boolean isMember = meetingMemberRepository.existsByMeetingIdAndUser_UserIdAndStatusNot(meetingId, userId,
                com.aidea.backend.domain.meeting.entity.enums.MemberStatus.LEFT);
        // APPROVE check? Typically only APPROVED members can join events.
        // Let's check status APPROVED.
        var member = meetingMemberRepository.findByMeetingIdAndUser_UserId(meetingId, userId);
        if (member.isEmpty()
                || member.get().getStatus() != com.aidea.backend.domain.meeting.entity.enums.MemberStatus.APPROVED) {
            throw new RuntimeException("모임 멤버만 참석할 수 있습니다.");
        }

        User user = userRepository.getReferenceById(userId);

        com.aidea.backend.domain.event.entity.EventParticipant participant = com.aidea.backend.domain.event.entity.EventParticipant
                .builder()
                .event(event)
                .user(user)
                .build();

        eventParticipantRepository.save(participant);
    }

    /**
     * 정모 참석 취소
     */
    @Transactional
    public void cancelParticipation(Long meetingId, Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("정모를 찾을 수 없습니다."));

        // ... comments ...

        eventParticipantRepository.deleteByEventIdAndUser_UserId(eventId, userId);
    }
}
