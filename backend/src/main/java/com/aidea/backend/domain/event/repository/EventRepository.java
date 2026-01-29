package com.aidea.backend.domain.event.repository;

import com.aidea.backend.domain.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    // 모임별 일정 목록 조회 (날짜순 정렬)
    List<Event> findByMeetingIdOrderByDateAsc(Long meetingId);

    // 모임 삭제 시 연관 일정 삭제
    void deleteByMeetingId(Long meetingId);
}
