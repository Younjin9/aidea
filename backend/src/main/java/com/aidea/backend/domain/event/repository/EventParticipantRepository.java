package com.aidea.backend.domain.event.repository;

import com.aidea.backend.domain.event.entity.EventParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {

    List<EventParticipant> findByEvent_Id(Long eventId);

    boolean existsByEvent_IdAndUser_UserId(Long eventId, Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT ep FROM EventParticipant ep WHERE ep.event.id = :eventId AND ep.user.userId = :userId")
    java.util.Optional<EventParticipant> findByEvent_IdAndUser_UserId(
            @org.springframework.data.repository.query.Param("eventId") Long eventId,
            @org.springframework.data.repository.query.Param("userId") Long userId);

    void deleteByEvent_Id(Long eventId);

    void deleteByEvent_IdAndUser_UserId(Long eventId, Long userId);

    void deleteByEvent_Meeting_Id(Long meetingId);

    void deleteByUser_UserId(Long userId);

    long countByEvent_Id(Long eventId);
}
