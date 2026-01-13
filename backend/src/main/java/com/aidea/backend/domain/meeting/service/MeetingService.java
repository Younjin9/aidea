package com.aidea.backend.domain.meeting.service;

import com.aidea.backend.domain.meeting.dto.request.CreateMeetingRequest;
import com.aidea.backend.domain.meeting.dto.response.MeetingResponse;
import com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse;
import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.entity.MeetingMember;
import com.aidea.backend.domain.meeting.entity.enums.MemberRole;
import com.aidea.backend.domain.meeting.entity.enums.MemberStatus;
import com.aidea.backend.domain.meeting.repository.MeetingMemberRepository;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 모임 비즈니스 로직
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingMemberRepository meetingMemberRepository;
    private final UserRepository userRepository;

    /**
     * 모임 생성
     * - Meeting 생성
     * - 생성자를 HOST로 자동 등록
     */
    @Transactional
    public MeetingResponse createMeeting(Long userId, CreateMeetingRequest request) {
        // 1. User 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 2. Meeting 생성
        Meeting meeting = Meeting.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .locationDetail(request.getLocationDetail())
                .maxMembers(request.getMaxMembers())
                .meetingDate(request.getMeetingDate())
                .isApprovalRequired(request.getIsApprovalRequired())
                .creator(user)
                .build();

        Meeting savedMeeting = meetingRepository.save(meeting);

        // 3. 생성자를 HOST로 등록
        MeetingMember hostMember = MeetingMember.builder()
                .meeting(savedMeeting)
                .user(user)
                .role(MemberRole.HOST)
                .status(MemberStatus.APPROVED)
                .build();

        meetingMemberRepository.save(hostMember);

        // 4. Response 반환
        return savedMeeting.toResponse();
    }

    /**
     * 모임 상세 조회
     */
    public MeetingResponse getMeetingById(Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        return meeting.toResponse();
    }

    /**
     * 모임 목록 조회 (페이징)
     */
    public Page<MeetingSummaryResponse> getAllMeetings(Pageable pageable) {
        Page<Meeting> meetings = meetingRepository.findAllByOrderByCreatedAtDesc(pageable);
        return meetings.map(Meeting::toSummary);
    }
}
