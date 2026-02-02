package com.aidea.backend.domain.event.repository;

import com.aidea.backend.domain.event.entity.EventParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {

    List<EventParticipant> findByEvent_Id(Long eventId);

    boolean existsByEvent_IdAndUser_UserId(Long eventId, Long userId);

    void deleteByEvent_Id(Long eventId);

    void deleteByEvent_IdAndUser_UserId(Long eventId, Long userId);

    void deleteByEvent_Meeting_Id(Long meetingId);

    void deleteByUser_UserId(Long userId);

    long countByEvent_Id(Long eventId);
}
