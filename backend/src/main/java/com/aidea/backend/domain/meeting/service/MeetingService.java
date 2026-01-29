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
import com.aidea.backend.global.infra.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.aidea.backend.domain.chat.repository.ChatRoomRepository; // Added import

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
    private final ChatRoomRepository chatRoomRepository; // Inject ChatRoomRepository
    private final com.aidea.backend.domain.chat.repository.ChatMessageRepository chatMessageRepository; // Inject
                                                                                                        // ChatMessageRepository
    private final com.aidea.backend.domain.event.repository.EventRepository eventRepository; // Inject EventRepository
    private final com.aidea.backend.domain.event.repository.EventParticipantRepository eventParticipantRepository; // Inject
    private final S3Service s3Service;

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

        // 2. 모임 생성
        Meeting meeting = request.toEntity(user);
        meetingRepository.save(meeting);

        // 3. HOST 등록
        MeetingMember hostMember = MeetingMember.createHost(meeting, user);
        meetingMemberRepository.save(hostMember);

        return meeting.toResponse("HOST", "APPROVED");
    }

    /**
     * 모임 상세 조회
     */
    public MeetingResponse getMeetingById(Long meetingId, Long userId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        String myRole = "NONE";
        String myStatus = "NONE";

        if (userId != null) {
            // 1. 호스트 여부 확인
            if (meeting.getCreator().getUserId().equals(userId)) {
                myRole = "HOST";
                myStatus = "APPROVED";
            } else {
                // 2. 멤버 여부 확인
                var member = meetingMemberRepository.findByMeetingIdAndUser_UserId(meetingId, userId);
                if (member.isPresent()) {
                    myRole = "MEMBER";
                    myStatus = member.get().getStatus().name();
                }
            }
        }

        return meeting.toResponse(myRole, myStatus);
    }

    /**
     * 모임 목록 조회 (페이징)
     */
    public Page<MeetingSummaryResponse> getAllMeetings(Pageable pageable, Long userId) {
        Page<Meeting> meetings = meetingRepository.findAllByOrderByCreatedAtDesc(pageable);
        return mapToSummaryWithAuth(meetings, userId);
    }

    /**
     * 모임 검색 (조건별 통합 검색)
     */
    public Page<MeetingSummaryResponse> searchMeetings(
            com.aidea.backend.domain.meeting.entity.enums.MeetingCategory category,
            com.aidea.backend.domain.meeting.entity.enums.Region region,
            Pageable pageable,
            Long userId) {

        Page<Meeting> meetings;

        // 조건에 따른 분기 처리
        if (category != null && region != null) {
            meetings = meetingRepository.findByCategoryAndRegion(category, region, pageable);
        } else if (category != null) {
            meetings = meetingRepository.findByCategory(category, pageable);
        } else if (region != null) {
            meetings = meetingRepository.findByRegion(region, pageable);
        } else {
            meetings = meetingRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return mapToSummaryWithAuth(meetings, userId);
    }

    /**
     * 모임 목록을 SummaryResponse로 변환 (권한 정보 포함)
     * - N+1 문제 해결을 위해 배치 조회 사용
     */
    private Page<MeetingSummaryResponse> mapToSummaryWithAuth(Page<Meeting> meetings, Long userId) {
        if (userId == null) {
            return meetings.map(m -> m.toSummary("NONE", "NONE"));
        }

        // 현재 페이지의 모임 ID 목록
        List<Long> meetingIds = meetings.getContent().stream()
                .map(Meeting::getId)
                .toList();

        // 유저가 참여 중인 멤버 정보 일괄 조회
        List<MeetingMember> myMemberships = meetingMemberRepository.findByUser_UserIdAndMeeting_IdIn(userId,
                meetingIds);

        // Map으로 변환 (MeetingId -> MeetingMember)
        var membershipMap = myMemberships.stream()
                .collect(Collectors.toMap(m -> m.getMeeting().getId(), m -> m));

        return meetings.map(meeting -> {
            String myRole = "NONE";
            String myStatus = "NONE";

            if (meeting.getCreator().getUserId().equals(userId)) {
                myRole = "HOST";
                myStatus = "APPROVED";
            } else {
                MeetingMember member = membershipMap.get(meeting.getId());
                if (member != null) {
                    myRole = "MEMBER";
                    myRole = member.getRole().name();
                    myStatus = member.getStatus().name();
                }
            }
            return meeting.toSummary(myRole, myStatus);
        });
    }

    /**
     * 모임 삭제
     * - HOST 권한 확인
     * - 연관된 데이터 순차 삭제 (DB Constraint 해결)
     */
    @Transactional
    public void deleteMeeting(Long meetingId, Long userId) {
        try {
            // 1. Meeting 조회
            Meeting meeting = meetingRepository.findById(meetingId)
                    .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

            // 2. HOST 권한 확인
            if (!meeting.getCreator().getUserId().equals(userId)) {
                throw new RuntimeException("모임을 삭제할 권한이 없습니다.");
            }

            // 3. 연관 데이터 삭제 (순서 중요)

            // 3-1. EventParticipant 삭제 (이벤트 참여자)
            eventParticipantRepository.deleteByEvent_Meeting_Id(meetingId);

            // 3-2. Event 삭제
            eventRepository.deleteByMeetingId(meetingId);

            // 3-3. ChatRoom & ChatMessage 삭제 (순서 중요: 메시지 -> 방)
            // Fix: Delete ChatMessage first to avoid FK constraint
            com.aidea.backend.domain.chat.entity.ChatRoom chatRoom = chatRoomRepository.findByMeetingId(meetingId)
                    .orElse(null);
            if (chatRoom != null) {
                long messageCount = chatMessageRepository.countByChatRoomId(chatRoom.getId());
                log.info("Deleting {} messages for meeting ID: {}", messageCount, meetingId);

                chatMessageRepository.deleteByChatRoomId(chatRoom.getId());
                chatRoomRepository.delete(chatRoom);
            }

            // 3-4. MeetingLike 삭제
            meetingLikeRepository.deleteByMeeting_Id(meetingId);

            // 3-5. MeetingMember 삭제
            meetingMemberRepository.deleteAllByMeetingId(meetingId);

            // 4. 모임 삭제
            log.info("Deleting meeting ID: {}", meetingId);
            meetingRepository.delete(meeting);
        } catch (Exception e) {
            log.error("Meeting deletion failed for ID: {}", meetingId, e);
            throw new RuntimeException("모임 삭제에 실패했습니다.", e);
        }
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

    /**
     * 모임 이미지 업로드
     */
    public String uploadMeetingImage(MultipartFile image) {
        return s3Service.uploadFile(image, "meeting-images");
    }
}
