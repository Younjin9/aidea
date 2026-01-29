package com.aidea.backend.domain.event.repository;

import com.aidea.backend.domain.event.entity.EventParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {

    List<EventParticipant> findByEventId(Long eventId);

    boolean existsByEventIdAndUser_UserId(Long eventId, Long userId);

    void deleteByEventId(Long eventId);

    void deleteByEventIdAndUser_UserId(Long eventId, Long userId);

    // For deleting all participants of all events in a meeting
    void deleteByEvent_Meeting_Id(Long meetingId);

    long countByEventId(Long eventId);
}
