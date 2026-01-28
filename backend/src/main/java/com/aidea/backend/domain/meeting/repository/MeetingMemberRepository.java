package com.aidea.backend.domain.meeting.repository;

import com.aidea.backend.domain.meeting.entity.MeetingMember;
import com.aidea.backend.domain.meeting.entity.enums.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeetingMemberRepository extends JpaRepository<MeetingMember, Long> {

    /**
     * 특정 모임의 특정 사용자 참가 정보 조회
     */
    Optional<MeetingMember> findByMeetingIdAndUser_UserId(Long meetingId, Long userId);

    /**
     * 중복 참가 확인 (LEFT 상태 제외)
     */
    boolean existsByMeetingIdAndUser_UserIdAndStatusNot(Long meetingId, Long userId, MemberStatus status);

    /**
     * 특정 상태의 참가자 목록 조회
     */
    List<MeetingMember> findByMeetingIdAndStatus(Long meetingId, MemberStatus status);

    /**
     * 모임의 모든 참가자 조회
     */
    List<MeetingMember> findByMeetingId(Long meetingId);

    /**
     * 특정 사용자의 모든 모임 참가 정보 조회
     */
    List<MeetingMember> findByUser_UserId(Long userId);

    /**
     * 특정 사용자의 모든 모임 참가 정보 조회 (상태 제외)
     */
    List<MeetingMember> findByUser_UserIdAndStatusNot(Long userId, MemberStatus status);
}
