package com.aidea.backend.domain.meeting.service;

import com.aidea.backend.domain.meeting.dto.request.CreateMeetingRequest;
import com.aidea.backend.domain.meeting.dto.response.MeetingResponse;
import com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse;
import com.aidea.backend.domain.meeting.dto.response.MeetingLikeResponse;
import com.aidea.backend.domain.meeting.dto.response.LikedMeetingResponse;
import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.entity.MeetingMember;
import com.aidea.backend.domain.meeting.entity.MeetingLike;
import com.aidea.backend.domain.meeting.entity.enums.MemberRole;
import com.aidea.backend.domain.meeting.entity.enums.MemberStatus;
import com.aidea.backend.domain.meeting.repository.MeetingMemberRepository;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.meeting.repository.MeetingLikeRepository;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

/**
 * 모임 비즈니스 로직
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingMemberRepository meetingMemberRepository;
    private final UserRepository userRepository;
    private final MeetingLikeRepository meetingLikeRepository;

    /**
     * 모임 생성
     * - Meeting 생성
     * - 생성자를 HOST로 자동 등록
     */
    @Transactional
    public MeetingResponse createMeeting(Long userId, CreateMeetingRequest request) {
        log.info("=== 모임 생성 시작 ===");
        log.info("Request: {}", request);
        log.info("Category Code: {}", request.getInterestCategoryId());
        log.info("Region: {}", request.getRegion());

        // 1. User 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 2. Meeting 생성
        Meeting meeting = Meeting.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .category(com.aidea.backend.domain.meeting.entity.enums.MeetingCategory
                        .findByCode(request.getInterestCategoryId())) // String -> Enum
                .region(com.aidea.backend.domain.meeting.entity.enums.Region.findByFullName(request.getRegion())) // String
                                                                                                                  // ->
                                                                                                                  // Enum
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .locationDetail(request.getLocationDetail())
                .maxMembers(request.getMaxMembers())
                .meetingDate(request.getMeetingDate())
                .isApprovalRequired(!request.getIsPublic()) // Assuming isPublic=true means approval not required, OR
                                                            // handling separately. Spec has isPublic. Let's use
                                                            // isPublic logic if entity has it. If not, map to approval.
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

    /**
     * 모임 검색 (조건별 통합 검색)
     * - category만 있음 → category 조회
     * - region만 있음 → region 조회
     * - 둘 다 있음 → category AND region 조회
     * - 둘 다 없음 → 전체 조회
     */
    public Page<MeetingSummaryResponse> searchMeetings(
            com.aidea.backend.domain.meeting.entity.enums.MeetingCategory category,
            com.aidea.backend.domain.meeting.entity.enums.Region region,
            Pageable pageable) {

        Page<Meeting> meetings;

        // 조건에 따른 분기 처리
        if (category != null && region != null) {
            // 둘 다 있음 → AND 조건
            meetings = meetingRepository.findByCategoryAndRegion(category, region, pageable);
        } else if (category != null) {
            // category만 있음
            meetings = meetingRepository.findByCategory(category, pageable);
        } else if (region != null) {
            // region만 있음
            meetings = meetingRepository.findByRegion(region, pageable);
        } else {
            // 둘 다 없음 → 전체 조회
            meetings = meetingRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return meetings.map(Meeting::toSummary);
    }

    /**
     * 모임 삭제
     * - HOST 권한 확인
     * - 연관된 MeetingMember도 자동 삭제 (Cascade)
     */
    @Transactional
    public void deleteMeeting(Long meetingId, Long userId) {
        // 1. Meeting 조회
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 2. HOST 권한 확인
        if (!meeting.getCreator().getUserId().equals(userId)) {
            throw new RuntimeException("모임을 삭제할 권한이 없습니다.");
        }

        // 3. 삭제 (MeetingMember는 Cascade로 자동 삭제)
        meetingRepository.delete(meeting);
    }

    /**
     * 모임 수정
     * - HOST 권한 확인
     * - 변경 가능한 필드만 업데이트
     */
    @Transactional
    public MeetingResponse updateMeeting(Long meetingId, Long userId,
            com.aidea.backend.domain.meeting.dto.request.UpdateMeetingRequest request) {
        // 1. Meeting 조회
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 2. HOST 권한 확인
        if (!meeting.getCreator().getUserId().equals(userId)) {
            throw new RuntimeException("모임을 수정할 권한이 없습니다.");
        }

        // 3. 업데이트
        meeting.update(request);

        // 4. Response 반환 (변경 감지로 자동 저장)
        return meeting.toResponse();
    }

    // ========== 참가 관리 ==========

    /**
     * 모임 참가 신청
     */
    @Transactional
    public com.aidea.backend.domain.meeting.dto.response.MemberResponse joinMeeting(Long meetingId, Long userId) {
        // 1. Meeting 조회
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 2. User 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 3. 중복 참가 확인 (LEFT 상태 제외)
        if (meetingMemberRepository.existsByMeetingIdAndUser_UserIdAndStatusNot(
                meetingId, userId, MemberStatus.LEFT)) {
            throw new RuntimeException("이미 참가 신청한 모임입니다.");
        }

        // 4. 정원 확인 (승인된 멤버 수 기준)
        if (meeting.isFull()) {
            throw new RuntimeException("모임 정원이 가득 찼습니다.");
        }

        // 5. MeetingMember 생성
        MeetingMember member = MeetingMember.createMember(
                meeting, user, meeting.getIsApprovalRequired());

        MeetingMember savedMember = meetingMemberRepository.save(member);

        // 6. 자동 승인인 경우 currentMembers 증가
        if (!meeting.getIsApprovalRequired()) {
            meeting.incrementMembers();
        }

        return savedMember.toMemberResponse();
    }

    /**
     * 승인된 참가자 목록 조회
     */
    public java.util.List<com.aidea.backend.domain.meeting.dto.response.MemberResponse> getMembers(Long meetingId) {
        return meetingMemberRepository.findByMeetingIdAndStatus(meetingId, MemberStatus.APPROVED)
                .stream()
                .map(MeetingMember::toMemberResponse)
                .toList();
    }

    /**
     * 대기 중인 참가 신청 목록 조회 (HOST 전용)
     */
    public java.util.List<com.aidea.backend.domain.meeting.dto.response.JoinRequestResponse> getPendingRequests(
            Long meetingId, Long userId) {
        // 1. Meeting 조회
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 2. HOST 권한 확인
        if (!meeting.getCreator().getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        // 3. PENDING 상태의 신청 목록 조회
        return meetingMemberRepository.findByMeetingIdAndStatus(meetingId, MemberStatus.PENDING)
                .stream()
                .map(MeetingMember::toJoinRequestResponse)
                .toList();
    }

    /**
     * 참가 신청 승인 (HOST 전용)
     */
    @Transactional
    public com.aidea.backend.domain.meeting.dto.response.MemberResponse approveJoinRequest(
            Long meetingId, Long memberId, Long userId) {
        // 1. Meeting 조회
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 2. HOST 권한 확인
        if (!meeting.getCreator().getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        // 3. MeetingMember 조회
        MeetingMember member = meetingMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("참가 신청을 찾을 수 없습니다."));

        // 4. 정원 확인
        if (meeting.isFull()) {
            throw new RuntimeException("모임 정원이 가득 찼습니다.");
        }

        // 5. 승인 처리
        member.approve();
        meeting.incrementMembers();

        return member.toMemberResponse();
    }

    /**
     * 참가 신청 거절 (HOST 전용)
     */
    @Transactional
    public void rejectJoinRequest(Long meetingId, Long memberId, Long userId) {
        // 1. Meeting 조회
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 2. HOST 권한 확인
        if (!meeting.getCreator().getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        // 3. MeetingMember 조회
        MeetingMember member = meetingMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("참가 신청을 찾을 수 없습니다."));

        // 4. 거절 처리
        member.reject();
    }

    /**
     * 모임 탈퇴
     */
    @Transactional
    public void leaveMeeting(Long meetingId, Long userId) {
        // 1. MeetingMember 조회
        MeetingMember member = meetingMemberRepository.findByMeetingIdAndUser_UserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("참가 정보를 찾을 수 없습니다."));

        // 2. HOST는 탈퇴 불가
        if (member.getRole() == MemberRole.HOST) {
            throw new RuntimeException("모임장은 탈퇴할 수 없습니다.");
        }

        // 3. Meeting 조회
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 4. 탈퇴 처리
        member.leave();
        meeting.decrementMembers();
    }

    /**
     * 참가자 강제 퇴출 (HOST 전용)
     */
    @Transactional
    public void removeMember(Long meetingId, Long memberId, Long userId) {
        // 1. Meeting 조회
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 2. HOST 권한 확인
        if (!meeting.getCreator().getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        // 3. MeetingMember 조회
        MeetingMember member = meetingMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("참가자를 찾을 수 없습니다."));

        // 4. HOST는 퇴출 불가
        if (member.getRole() == MemberRole.HOST) {
            throw new RuntimeException("모임장은 퇴출할 수 없습니다.");
        }

        // 5. 퇴출 처리
        member.leave();
        meeting.decrementMembers();
    }

    // ========== 찜 기능 ==========

    /**
     * 모임 찜하기/찜 취소 (토글)
     */
    @Transactional
    public MeetingLikeResponse toggleMeetingLike(Long meetingId, Long userId) {
        log.info("찜 토글 요청: meetingId={}, userId={}", meetingId, userId);

        // 1. 사용자와 모임 존재 확인
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 2. 기존 찜 여부 확인
        var existingLike = meetingLikeRepository.findByUser_UserIdAndMeeting_Id(userId, meetingId);

        if (existingLike.isPresent()) {
            // 찜 취소
            meetingLikeRepository.delete(existingLike.get());

            return MeetingLikeResponse.builder()
                    .isLiked(false)
                    .likeCount((long) meetingLikeRepository.countByMeeting_Id(meetingId))
                    .message("찜을 취소했습니다.")
                    .build();
        } else {
            // 찜하기
            User user = userRepository.getReferenceById(userId);
            MeetingLike meetingLike = MeetingLike.builder()
                    .user(user)
                    .meeting(meeting)
                    .build();
            meetingLikeRepository.save(meetingLike);

            return MeetingLikeResponse.builder()
                    .isLiked(true)
                    .likeCount((long) meetingLikeRepository.countByMeeting_Id(meetingId))
                    .message("찜했습니다.")
                    .build();
        }
    }

    /**
     * 찜한 모임 목록 조회
     */
    @Transactional(readOnly = true)
    public List<LikedMeetingResponse> getLikedMeetings(Long userId) {
        log.info("찜한 모임 목록 조회: userId={}", userId);

        List<MeetingLike> likes = meetingLikeRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);

        return likes.stream()
                .map(like -> LikedMeetingResponse.builder()
                        .meetingLikeId(like.getMeetingLikeId())
                        .meeting(like.getMeeting().toResponse())
                        .likedAt(like.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 특정 모임의 찜 상태 확인
     */
    @Transactional(readOnly = true)
    public MeetingLikeResponse getLikeStatus(Long meetingId, Long userId) {
        boolean isLiked = meetingLikeRepository.existsByUser_UserIdAndMeeting_Id(userId, meetingId);
        long likeCount = meetingLikeRepository.countByMeeting_Id(meetingId);

        return MeetingLikeResponse.builder()
                .isLiked(isLiked)
                .likeCount(likeCount)
                .build();
    }

    /**
     * 모임의 총 찜 개수 조회
     */
    @Transactional(readOnly = true)
    public long getLikeCount(Long meetingId) {
        return meetingLikeRepository.countByMeeting_Id(meetingId);
    }
}
