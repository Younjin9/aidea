package com.aidea.backend.domain.meeting.service;

import com.aidea.backend.domain.meeting.dto.request.CreateMeetingRequest;
import java.util.Optional;
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
import com.aidea.backend.domain.chat.repository.ChatRoomRepository;
import com.aidea.backend.domain.chat.service.ChatService; // Added import
import com.aidea.backend.domain.meeting.repository.MeetingHobbyRepository;
import com.aidea.backend.domain.meeting.entity.MeetingHobby;

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
    private final ChatRoomRepository chatRoomRepository;
    private final com.aidea.backend.domain.chat.repository.ChatMessageRepository chatMessageRepository;
    private final com.aidea.backend.domain.event.repository.EventRepository eventRepository;
    private final com.aidea.backend.domain.event.repository.EventParticipantRepository eventParticipantRepository;
    private final S3Service s3Service;
    private final ChatService chatService;
    private final MeetingHobbyRepository meetingHobbyRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

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

        // 2-1. meeting_hobby 저장 (카테고리 1개만 매핑)
        String categoryIdStr = request.getInterestCategoryId(); // ✅ String으로 받기
        if (categoryIdStr != null && !categoryIdStr.isBlank()) {
            Long categoryId = Long.parseLong(categoryIdStr); // ✅ Long 변환
            meetingHobbyRepository.save(new MeetingHobby(meeting.getId(), categoryId));
        }

        // 3. HOST 등록
        MeetingMember hostMember = MeetingMember.createHost(meeting, user);
        meetingMemberRepository.save(hostMember);

        // 4. 채팅방 생성 (자동)
        try {
            chatService.createChatRoomForMeeting(meeting.getId());
            log.info("채팅방 생성 완료: meetingId={}", meeting.getId());
        } catch (Exception e) {
            log.error("채팅방 자동 생성 실패: {}", e.getMessage());
            // 성공 실패와 상관없이 모임 생성을 계속 진행하거나 처리 결정
        }

        return meeting.toResponse("HOST", "APPROVED");
    }

    /**
     * 모임 상세 조회
     * ✅ members, events 배열 포함 (N+1 최소화)
     */
    public MeetingResponse getMeetingById(Long meetingId, Long userId) {
        // 1. Meeting 조회
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // ✅ 1. myRole, myStatus 설정 및 members 배열 생성 (단일 쿼리로 최적화)
        String myRole = "NONE";
        String myStatus = "NONE";

        // userId 검증
        if (userId == null) {
            log.warn("getUserId returned null for meeting {}, treating as guest user", meetingId);
        }

        // 모든 활성 멤버 조회 (LEFT 제외) - 단일 쿼리
        List<MeetingMember> allActiveMembers = meetingMemberRepository
                .findByMeetingIdAndStatusNot(meetingId, MemberStatus.LEFT);

        // 현재 사용자의 멤버십 찾기 (스트림 필터링)
        if (userId != null) {
            // 호스트 여부 확인
            if (meeting.getCreator().getUserId().equals(userId)) {
                myRole = "HOST";
                myStatus = "APPROVED";
                log.debug("User {} is HOST of meeting {}", userId, meetingId);
            } else {
                // 멤버 여부 확인 (메모리에서 필터링)
                Optional<MeetingMember> myMembership = allActiveMembers.stream()
                        .filter(m -> m.getUser().getUserId().equals(userId))
                        .findFirst();

                if (myMembership.isPresent()) {
                    myRole = myMembership.get().getRole().name();
                    myStatus = myMembership.get().getStatus().name();
                    log.debug("User {} has role {} and status {} in meeting {}",
                            userId, myRole, myStatus, meetingId);
                } else {
                    log.debug("User {} is not a member of meeting {}", userId, meetingId);
                }
            }
        }

        // ✅ 2. members 배열 생성 (APPROVED 멤버만 필터링)
        List<com.aidea.backend.domain.meeting.dto.response.MemberResponse> members = allActiveMembers
                .stream()
                .filter(m -> m.getStatus() == MemberStatus.APPROVED)
                .map(com.aidea.backend.domain.meeting.entity.MeetingMember::toMemberResponse)
                .collect(Collectors.toList());

        // ✅ 3. events 배열 생성
        List<com.aidea.backend.domain.event.dto.response.EventSummaryDto> events = eventRepository
                .findByMeetingIdOrderByDateAsc(meetingId).stream()
                .map(event -> com.aidea.backend.domain.event.dto.response.EventSummaryDto.builder()
                        .eventId(event.getId())
                        .title(event.getTitle())
                        .scheduledAt(event.getDate())
                        .date(event.getDate() != null ? event.getDate().toLocalDate().toString() : null)
                        .placeName(event.getLocationName())
                        .cost(parseCostToInteger(event.getCost()))
                        .maxParticipants(event.getMaxParticipants())
                        .participantCount(event.getParticipants().size())
                        .participants(event.getParticipants().stream()
                                .map(p -> new com.aidea.backend.domain.event.dto.response.EventSummaryDto.ParticipantDto(
                                        p.getUser().getUserId(),
                                        p.getUser().getNickname(),
                                        p.getUser().getProfileImage(),
                                        p.getUser().getUserId().equals(meeting.getCreator().getUserId()) ? "HOST"
                                                : "MEMBER",
                                        "APPROVED", // 정모 참여는 현재 별도 승인 없음
                                        p.getJoinedAt()))
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        // ✅ 4. MeetingResponse 생성 (members, events, memberCount 포함)
        MeetingResponse response = meeting.toResponse(myRole, myStatus);

        // Builder 패턴으로 새 필드 추가
        return MeetingResponse.builder()
                .groupId(response.getGroupId())
                .title(response.getTitle())
                .description(response.getDescription())
                .imageUrl(response.getImageUrl())
                .interestCategoryId(response.getInterestCategoryId())
                .interestCategoryName(response.getInterestCategoryName())
                .region(response.getRegion())
                .regionFullName(response.getRegionFullName())
                .location(response.getLocation())
                .latitude(response.getLatitude())
                .longitude(response.getLongitude())
                .locationDetail(response.getLocationDetail())
                .maxMembers(response.getMaxMembers())
                .currentMembers(response.getCurrentMembers())
                .meetingDate(response.getMeetingDate())
                .status(response.getStatus())
                .isPublic(response.getIsPublic())
                .creator(response.getCreator())
                .ownerUserId(response.getOwnerUserId()) // ✅ 추가: Frontend 권한 체크용
                .createdAt(response.getCreatedAt())
                .updatedAt(response.getUpdatedAt())
                .myRole(myRole)
                .myStatus(myStatus)
                .isApprovalRequired(meeting.getIsApprovalRequired()) // 승인 필요 여부 추가
                .memberCount(members.size()) // ✅ 추가
                .members(members) // ✅ 추가
                .events(events) // ✅ 추가
                .build();
    }

    /**
     * ✅ Helper: cost String을 Integer로 변환
     */
    private Integer parseCostToInteger(String cost) {
        if (cost == null || cost.trim().isEmpty()) {
            return 0;
        }
        try {
            // 숫자만 추출
            String numericOnly = cost.replaceAll("[^0-9]", "");
            return numericOnly.isEmpty() ? 0 : Integer.parseInt(numericOnly);
        } catch (NumberFormatException e) {
            return 0;
        }
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
    public com.aidea.backend.domain.meeting.dto.response.MemberResponse joinMeeting(Long meetingId, Long userId,
            String requestMessage) {
        // 1. Meeting 조회
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 2. User 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 3. 기존 멤버십 확인 (재가입 처리 포함)
        Optional<MeetingMember> existingMember = meetingMemberRepository
                .findByMeetingIdAndUser_UserId(meetingId, userId);

        if (existingMember.isPresent()) {
            MeetingMember member = existingMember.get();
            MemberStatus currentStatus = member.getStatus();

            // LEFT 상태인 경우 재활성화 (UPDATE)
            if (currentStatus == MemberStatus.LEFT) {
                log.info("재가입 처리: userId={}, meetingId={}", userId, meetingId);
                boolean autoApprove = meeting.isAutoApprove();
                member.reactivate(requestMessage, autoApprove);
                MeetingMember savedMember = meetingMemberRepository.save(member);

                // 자동 승인인 경우 currentMembers 증가
                if (autoApprove) {
                    meeting.incrementMembers();
                }

                // 가입 알림 전송
                sendMemberJoinedNotification(meeting, user, true);

                return savedMember.toMemberResponse();
            } else {
                // PENDING, APPROVED, REJECTED 상태인 경우 에러
                throw new RuntimeException("이미 참가 신청한 모임입니다. 현재 상태: " + currentStatus);
            }
        }

        // 4. 정원 확인 (승인된 멤버 수 기준)
        if (meeting.isFull()) {
            throw new RuntimeException("모임 정원이 가득 찼습니다.");
        }

        // 5. MeetingMember 생성
        boolean autoApprove = meeting.isAutoApprove();
        MeetingMember member = MeetingMember.createMember(meeting, user, !autoApprove, requestMessage);

        MeetingMember savedMember = meetingMemberRepository.save(member);

        // 6. 자동 승인인 경우 currentMembers 증가
        if (autoApprove) {
            meeting.incrementMembers();
        }

        log.info("참가 신청 완료: userId={}, meetingId={}, status={}", userId, meetingId, savedMember.getStatus());

        // 가입 알림 전송
        sendMemberJoinedNotification(meeting, user, false);

        return savedMember.toMemberResponse();
    }

    /**
     * 멤버 가입 알림 전송 (WebSocket 및 시스템 메시지)
     */
    private void sendMemberJoinedNotification(Meeting meeting, User user, boolean isRejoin) {
        // 승인된 멤버인 경우에만 알림 전송 (자동 승인 정책 기준)
        if (meeting.isAutoApprove()) {
            // 1. WebSocket 알림 (Meeting 채널)
            java.util.Map<String, Object> notification = new java.util.HashMap<>();
            notification.put("type", "MEMBER_JOINED");
            notification.put("meetingId", meeting.getId());
            notification.put("userId", user.getUserId());
            notification.put("username", user.getNickname());
            notification.put("message", user.getNickname() + "님이 모임에 " + (isRejoin ? "재" : "") + "참여했습니다.");
            notification.put("timestamp", java.time.LocalDateTime.now());

            messagingTemplate.convertAndSend("/topic/meeting/" + meeting.getId(), notification);

            // 2. 채팅방 시스템 메시지 저장 및 전송
            chatRoomRepository.findByMeetingId(meeting.getId()).ifPresent(chatRoom -> {
                com.aidea.backend.domain.chat.entity.ChatMessage welcomeMessage = com.aidea.backend.domain.chat.entity.ChatMessage
                        .builder()
                        .chatRoom(chatRoom)
                        .sender(user) // 시스템 메시지여도 일단 발신자를 해당 사용자로 하거나 별도 시스템 유저 정의 필요
                        .message(user.getNickname() + "님이 모임에 참여했습니다. 환영합니다! 👋")
                        .messageType(com.aidea.backend.domain.chat.entity.ChatMessage.MessageType.ENTER)
                        .build();

                com.aidea.backend.domain.chat.entity.ChatMessage savedMessage = chatMessageRepository
                        .save(welcomeMessage);
                messagingTemplate.convertAndSend("/topic/meeting/" + meeting.getId(), savedMessage.toResponse());
            });
        }
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
        log.info("참가 신청 승인 시도: meetingId={}, memberId={}, hostUserId={}", meetingId, memberId, userId);
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
        log.info("참가 신청 거절 시도: meetingId={}, memberId={}, hostUserId={}", meetingId, memberId, userId);
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
        MemberStatus prevStatus = member.getStatus();
        member.leave();
        log.info("모임 탈퇴/참가 취소 처리: userId={}, meetingId={}, prevStatus={}", userId, meetingId, prevStatus);

        // 5. APPROVED 상태였을 때만 멤버 수 감소
        if (prevStatus == MemberStatus.APPROVED) {
            meeting.decrementMembers();
            log.info("모임 인원 감소 처리: meetingId={}", meetingId);
        }
    }

    /**
     * 참가자 강제 퇴출 (HOST 전용)
     */
    @Transactional
    public void removeMember(Long meetingId, Long memberId, Long hostUserId) {
        log.info("멤버 강퇴 시도: meetingId={}, memberId={}, hostUserId={}", meetingId, memberId, hostUserId);
        // 1. Meeting 조회
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 2. HOST 권한 확인
        if (!meeting.getCreator().getUserId().equals(hostUserId)) {
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

    /**
     * 모임장 권한 양도 (HOST 전용)
     */
    @Transactional
    public void transferHost(Long meetingId, Long newHostUserId, Long currentHostId) {
        log.info("모임장 권한 양도 시도: meetingId={}, newHostUserId={}, currentHostId={}", meetingId, newHostUserId,
                currentHostId);

        // 1. 모임 조회
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

        // 2. 현재 요청자가 모임장인지 확인
        if (!meeting.getCreator().getUserId().equals(currentHostId)) {
            throw new RuntimeException("모임장 권한 위임은 모임장만 가능합니다.");
        }

        // 3. 자기 자신에게 양도하는지 확인
        if (currentHostId.equals(newHostUserId)) {
            throw new RuntimeException("이미 모임장입니다.");
        }

        // 4. 새 모임장 후보 (멤버) 조회
        MeetingMember newHostMember = meetingMemberRepository.findByMeetingIdAndUser_UserId(meetingId, newHostUserId)
                .orElseThrow(() -> new RuntimeException("양도할 멤버를 찾을 수 없습니다."));

        // 5. 멤버 상태 확인 (APPROVED 상태여야 함)
        if (newHostMember.getStatus() != MemberStatus.APPROVED) {
            throw new RuntimeException("승인된 멤버에게만 모임장을 위임할 수 있습니다.");
        }

        // 6. 현재 모임장 (멤버) 조회
        MeetingMember currentHostMember = meetingMemberRepository
                .findByMeetingIdAndUser_UserId(meetingId, currentHostId)
                .orElseThrow(() -> new RuntimeException("현재 모임장 정보를 찾을 수 없습니다."));

        // 7. 권한 변경 (원자적 처리)
        // 7-1. 기존 모임장 -> 일반 멤버
        currentHostMember.assignMember();

        // 7-2. 새 모임장 -> HOST
        newHostMember.assignHost();

        // 7-3. 모임 Creator 정보 업데이트
        meeting.changeCreator(newHostMember.getUser());

        // ✅ 변경 사항 명시적 저장 (문제 방지)
        meetingMemberRepository.saveAll(java.util.List.of(currentHostMember, newHostMember));
        meetingRepository.save(meeting);

        log.info("모임장 권한 양도 완료: meetingId={}, oldHost={}, newHost={}", meetingId, currentHostId, newHostUserId);
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
