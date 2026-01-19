package com.aidea.backend.domain.meeting.repository;

import com.aidea.backend.domain.meeting.entity.Meeting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    /**
     * 모임 목록 조회 (최신순)
     */
    Page<Meeting> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
