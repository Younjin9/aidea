package com.aidea.backend.domain.meeting.repository;

import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.entity.enums.MeetingCategory;
import com.aidea.backend.domain.meeting.entity.enums.MeetingStatus;
import com.aidea.backend.domain.meeting.entity.enums.Region;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.Modifying;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

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

        // ========== Cleanup 관리 ==========

        /**
         * 1단계: 날짜 지난 모임들 COMPLETED로 변경
         */
        @Modifying
        @Query("UPDATE Meeting m SET m.status = com.aidea.backend.domain.meeting.entity.enums.MeetingStatus.COMPLETED WHERE m.meetingDate < :threshold AND m.status <> com.aidea.backend.domain.meeting.entity.enums.MeetingStatus.COMPLETED AND m.isDeleted = false")
        void updateStatusToCompleted(@Param("threshold") LocalDateTime threshold);

        /**
         * 2단계: 일정 기간(2주) 지난 모임들 Soft Delete
         */
        @Modifying
        @Query("UPDATE Meeting m SET m.isDeleted = true, m.deletedAt = :now WHERE m.meetingDate < :threshold AND m.isDeleted = false")
        void markAsDeleted(@Param("threshold") LocalDateTime threshold, @Param("now") LocalDateTime now);

        /**
         * 3단계: Soft Delete 후 1달 지난 데이터 물리 삭제
         */
        @Modifying
        @Query("DELETE FROM Meeting m WHERE m.isDeleted = true AND m.deletedAt < :threshold")
        void permanentlyDelete(@Param("threshold") LocalDateTime threshold);

        /**
         * 물리 삭제 대상 ID 목록 조회
         */
        @Query("SELECT m.id FROM Meeting m WHERE m.isDeleted = true AND m.deletedAt < :threshold")
        List<Long> findIdsByDeletedAtBefore(@Param("threshold") LocalDateTime threshold);

        /**
         * 물리 삭제 (ID 기반)
         */
        @Modifying
        @Query("DELETE FROM Meeting m WHERE m.id IN :ids")
        void deleteByIdIn(@Param("ids") List<Long> ids);
}
