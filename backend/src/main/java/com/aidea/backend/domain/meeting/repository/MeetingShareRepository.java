package com.aidea.backend.domain.meeting.repository;

import com.aidea.backend.domain.meeting.entity.MeetingShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

public interface MeetingShareRepository extends JpaRepository<MeetingShare, Long> {

    Optional<MeetingShare> findByShareToken(String shareToken);

    boolean existsByShareToken(String shareToken);

    // Reuse: Find active link for same meeting & user
    // Only return if expiresAt is AFTER current time (i.e. still valid)
    @Query("SELECT ms FROM MeetingShare ms WHERE ms.meeting.id = :meetingId AND ms.user.userId = :userId AND ms.expiresAt > :now ORDER BY ms.expiresAt DESC LIMIT 1")
    Optional<MeetingShare> findActiveShare(
            @Param("meetingId") Long meetingId,
            @Param("userId") Long userId,
            @Param("now") LocalDateTime now);

    @Transactional
    @Modifying
    @Query("DELETE FROM MeetingShare ms WHERE ms.expiresAt < :now")
    void deleteByExpiresAtBefore(@Param("now") LocalDateTime now);

    /**
     * 여러 모임의 공유 링크 전체 일괄 삭제 (Cleanup용)
     */
    @Modifying
    @Query("DELETE FROM MeetingShare ms WHERE ms.meeting.id IN :meetingIds")
    void deleteByMeetingIdIn(@Param("meetingIds") List<Long> meetingIds);
}
