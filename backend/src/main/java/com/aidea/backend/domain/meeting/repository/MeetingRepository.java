package com.aidea.backend.domain.meeting.repository;

import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.entity.enums.MeetingCategory;
import com.aidea.backend.domain.meeting.entity.enums.MeetingStatus;
import com.aidea.backend.domain.meeting.entity.enums.Region;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    /**
     * 모임 목록 조회 (최신순)
     */
    Page<Meeting> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // ========== 카테고리별 조회 ==========
    Page<Meeting> findByCategory(MeetingCategory category, Pageable pageable);

    Page<Meeting> findByCategoryAndStatus(
            MeetingCategory category,
            MeetingStatus status,
            Pageable pageable);

    // ========== 지역별 조회 ==========
    Page<Meeting> findByRegion(Region region, Pageable pageable);

    Page<Meeting> findByRegionAndStatus(
            Region region,
            MeetingStatus status,
            Pageable pageable);

    // ========== 카테고리 + 지역 조합 조회 ==========
    Page<Meeting> findByCategoryAndRegion(
            MeetingCategory category,
            Region region,
            Pageable pageable);

    Page<Meeting> findByCategoryAndRegionAndStatus(
            MeetingCategory category,
            Region region,
            MeetingStatus status,
            Pageable pageable);

    /**
     * 특정 사용자가 개설한 모임 목록 조회
     */
    List<Meeting> findByCreator_UserId(Long userId);
}
