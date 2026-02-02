package com.aidea.backend.domain.event.repository;

import com.aidea.backend.domain.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    // 모임별 일정 목록 조회 (날짜순 정렬)
    List<Event> findByMeetingIdOrderByDateAsc(Long meetingId);

    // 모임 삭제 시 연관 일정 삭제
    void deleteByMeetingId(Long meetingId);

    // ========== Cleanup 관리 ==========

    /**
     * 2단계: 일정 기간(2주) 지난 정모들 Soft Delete
     */
    @Modifying
    @Query("UPDATE Event e SET e.isDeleted = true, e.deletedAt = :now WHERE e.date < :threshold AND e.isDeleted = false")
    void markAsDeleted(@Param("threshold") LocalDateTime threshold, @Param("now") LocalDateTime now);

    /**
     * 3단계: Soft Delete 후 1달 지난 데이터 물리 삭제
     */
    @Modifying
    @Query("DELETE FROM Event e WHERE e.isDeleted = true AND e.deletedAt < :threshold")
    void permanentlyDelete(@Param("threshold") LocalDateTime threshold);

    /**
     * 물리 삭제 대상 ID 목록 조회
     */
    @Query("SELECT e.id FROM Event e WHERE e.isDeleted = true AND e.deletedAt < :threshold")
    List<Long> findIdsByDeletedAtBefore(@Param("threshold") LocalDateTime threshold);

    /**
     * 물리 삭제 (ID 기반)
     */
    @Modifying
    @Query("DELETE FROM Event e WHERE e.id IN :ids")
    void deleteByIdIn(@Param("ids") List<Long> ids);

    /**
     * 여러 모임의 정모 전체 일괄 삭제
     */
    @Modifying
    @Query("DELETE FROM Event e WHERE e.meeting.id IN :meetingIds")
    void deleteByMeetingIdIn(@Param("meetingIds") List<Long> meetingIds);
}
