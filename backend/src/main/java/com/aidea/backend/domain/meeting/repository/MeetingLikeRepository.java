package com.aidea.backend.domain.meeting.repository;

import com.aidea.backend.domain.meeting.entity.MeetingLike;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface MeetingLikeRepository extends JpaRepository<MeetingLike, Long> {

    /**
     * 특정 사용자가 특정 모임을 찜했는지 확인
     */
    Optional<MeetingLike> findByUser_UserIdAndMeeting_Id(Long userId, Long meetingId);

    /**
     * 특정 사용자가 찜한 모든 모임 목록 조회 (최신순)
     */
    List<MeetingLike> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 특정 모임을 찜한 사용자 수 계산
     */
    int countByMeeting_Id(Long meetingId);

    /**
     * 특정 사용자가 특정 모임을 찜했는지 여부 확인
     */
    boolean existsByUser_UserIdAndMeeting_Id(Long userId, Long meetingId);

    /**
     * 사용자가 찜한 특정 모임 삭제
     */
    /**
     * 사용자가 찜한 특정 모임 삭제
     */
    void deleteByUser_UserIdAndMeeting_Id(Long userId, Long meetingId);

    /**
     * 특정 사용자가 찜한 모든 찜 삭제 (회원 탈퇴 시 사용)
     */
    void deleteByUser_UserId(Long userId);

    /**
     * 특정 모임의 모든 찜 삭제 (모임 삭제 시 사용)
     */
    void deleteByMeeting_Id(Long meetingId);

    /**
     * 여러 모임의 찜 전체 일괄 삭제 (Cleanup용)
     */
    @Modifying
    @Query("DELETE FROM MeetingLike ml WHERE ml.meeting.id IN :meetingIds")
    void deleteByMeetingIdIn(@Param("meetingIds") List<Long> meetingIds);
}