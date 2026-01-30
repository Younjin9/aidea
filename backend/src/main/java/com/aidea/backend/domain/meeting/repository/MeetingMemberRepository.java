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
     * 특정 모임의 특정 상태가 아닌 멤버 조회 (LEFT 제외)
     */
    List<MeetingMember> findByMeetingIdAndStatusNot(Long meetingId, MemberStatus status);

    /**
     * 특정 모임의 특정 상태인 멤버 조회 (PENDING 조회용)
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

    /**
     * 특정 사용자가 특정 모임 리스트에 포함되어 있는지 일괄 조회 (N+1 해결용)
     */
    List<MeetingMember> findByUser_UserIdAndMeeting_IdIn(Long userId, List<Long> meetingIds);

    /**
     * 모임의 모든 멤버 삭제 (모임 삭제 시 사용)
     */
    void deleteAllByMeetingId(Long meetingId);
}
