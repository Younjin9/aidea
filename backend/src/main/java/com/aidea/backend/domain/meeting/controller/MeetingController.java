package com.aidea.backend.domain.meeting.controller;

import com.aidea.backend.domain.meeting.dto.request.CreateMeetingRequest;
import com.aidea.backend.domain.meeting.dto.request.UpdateMeetingRequest;
import com.aidea.backend.domain.meeting.dto.response.MeetingResponse;
import com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse;
import com.aidea.backend.domain.meeting.dto.response.MeetingLikeResponse;
import com.aidea.backend.domain.meeting.service.MeetingService;
import com.aidea.backend.global.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 모임 API Controller
 */
@Tag(name = "Meeting", description = "모임 API")
@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
    private final com.aidea.backend.domain.user.repository.UserRepository userRepository;

    /**
     * 현재 로그인한 사용자 ID 가져오기 (비로그인 시 null)
     */
    private Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) {
                return null;
            }
            String email = auth.getName();
            if (email == null || email.equals("anonymousUser")) {
                return null;
            }
            return userRepository.findByEmail(email)
                    .map(com.aidea.backend.domain.user.entity.User::getUserId)
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 기본 사용자 인증 (필수 로그인용)
     */
    private com.aidea.backend.domain.user.entity.User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    /**
     * 모임 생성
     */
    @Operation(summary = "모임 생성", description = "새로운 모임을 생성합니다")
    @PostMapping
    public ResponseEntity<ApiResponse<MeetingResponse>> createMeeting(
            @Valid @RequestBody CreateMeetingRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        MeetingResponse response = meetingService.createMeeting(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * 모임 상세 조회
     */
    @Operation(summary = "모임 상세 조회", description = "모임 ID로 상세 정보를 조회합니다")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MeetingResponse>> getMeeting(
            @PathVariable Long id) {
        MeetingResponse response = meetingService.getMeetingById(id, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 모임 목록 조회 (페이징)
     */
    @Operation(summary = "모임 목록 조회", description = "모임 목록을 페이징하여 조회합니다")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<MeetingSummaryResponse>>> getAllMeetings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MeetingSummaryResponse> response = meetingService.getAllMeetings(pageable, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 모임 검색 (조건별 통합 검색)
     */
    @Operation(summary = "모임 검색", description = "카테고리, 지역 조건으로 모임을 검색합니다")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<MeetingSummaryResponse>>> searchMeetings(
            @RequestParam(required = false) com.aidea.backend.domain.meeting.entity.enums.MeetingCategory category,
            @RequestParam(required = false) com.aidea.backend.domain.meeting.entity.enums.Region region,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MeetingSummaryResponse> response = meetingService.searchMeetings(category, region, pageable,
                getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 모임 삭제
     */
    @Operation(summary = "모임 삭제", description = "모임을 삭제합니다 (HOST만 가능)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        meetingService.deleteMeeting(id, getAuthenticatedUser().getUserId());
        return ResponseEntity.ok().build();
    }

    /**
     * 모임 수정
     */
    @Operation(summary = "모임 수정", description = "모임 정보를 수정합니다 (HOST만 가능)")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MeetingResponse>> updateMeeting(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMeetingRequest request) {
        MeetingResponse response = meetingService.updateMeeting(id, getAuthenticatedUser().getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 모임 참가 신청
     */
    @Operation(summary = "모임 참가 신청", description = "모임에 참가 신청을 합니다")
    @PostMapping("/{id}/join")
    public ResponseEntity<com.aidea.backend.domain.meeting.dto.response.MemberResponse> joinMeeting(
            @PathVariable Long id) {
        com.aidea.backend.domain.meeting.dto.response.MemberResponse response = meetingService.joinMeeting(id,
                getAuthenticatedUser().getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 참가자 목록 조회
     */
    @Operation(summary = "참가자 목록 조회", description = "승인된 참가자 목록을 조회합니다")
    @GetMapping("/{id}/members")
    public ResponseEntity<java.util.List<com.aidea.backend.domain.meeting.dto.response.MemberResponse>> getMembers(
            @PathVariable Long id) {
        java.util.List<com.aidea.backend.domain.meeting.dto.response.MemberResponse> response = meetingService
                .getMembers(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 참가 신청 목록 조회 (HOST 전용)
     */
    @Operation(summary = "참가 신청 목록 조회", description = "대기 중인 참가 신청 목록을 조회합니다 (HOST 전용)")
    @GetMapping("/{id}/join-requests")
    public ResponseEntity<java.util.List<com.aidea.backend.domain.meeting.dto.response.JoinRequestResponse>> getPendingRequests(
            @PathVariable Long id) {
        java.util.List<com.aidea.backend.domain.meeting.dto.response.JoinRequestResponse> response = meetingService
                .getPendingRequests(id, getAuthenticatedUser().getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * 참가 신청 승인 (HOST 전용)
     */
    @Operation(summary = "참가 신청 승인", description = "참가 신청을 승인합니다 (HOST 전용)")
    @PostMapping("/{id}/join-requests/{memberId}/approve")
    public ResponseEntity<com.aidea.backend.domain.meeting.dto.response.MemberResponse> approveJoinRequest(
            @PathVariable Long id,
            @PathVariable Long memberId) {
        com.aidea.backend.domain.meeting.dto.response.MemberResponse response = meetingService.approveJoinRequest(id,
                memberId, getAuthenticatedUser().getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * 참가 신청 거절 (HOST 전용)
     */
    @Operation(summary = "참가 신청 거절", description = "참가 신청을 거절합니다 (HOST 전용)")
    @PostMapping("/{id}/join-requests/{memberId}/reject")
    public ResponseEntity<Void> rejectJoinRequest(
            @PathVariable Long id,
            @PathVariable Long memberId) {
        meetingService.rejectJoinRequest(id, memberId, getAuthenticatedUser().getUserId());
        return ResponseEntity.ok().build();
    }

    /**
     * 모임 탈퇴
     */
    @Operation(summary = "모임 탈퇴", description = "모임에서 탈퇴합니다")
    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveMeeting(@PathVariable Long id) {
        meetingService.leaveMeeting(id, getAuthenticatedUser().getUserId());
        return ResponseEntity.ok().build();
    }

    /**
     * 참가자 강제 퇴출 (HOST 전용)
     */
    @Operation(summary = "참가자 강제 퇴출", description = "참가자를 강제로 퇴출시킵니다 (HOST 전용)")
    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long memberId) {
        meetingService.removeMember(id, memberId, getAuthenticatedUser().getUserId());
        return ResponseEntity.noContent().build();
    }

    // ========== 찜 기능 ==========

    /**
     * 모임 찜하기/찜 취소
     */
    @Operation(summary = "모임 찜하기/찜 취소", description = "모임을 찜하거나 취소합니다 (토글)")
    @PostMapping("/{id}/like")
    public ResponseEntity<MeetingLikeResponse> toggleLike(
            @PathVariable Long id) {
        MeetingLikeResponse response = meetingService.toggleMeetingLike(id, getAuthenticatedUser().getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * 찜 상태 확인
     */
    @Operation(summary = "찜 상태 확인", description = "특정 모임의 찜 상태를 확인합니다.")
    @GetMapping("/{id}/like-status")
    public ResponseEntity<MeetingLikeResponse> getLikeStatus(
            @PathVariable Long id) {
        MeetingLikeResponse response = meetingService.getLikeStatus(id, getAuthenticatedUser().getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * 모임 이미지 업로드
     */
    @Operation(summary = "모임 이미지 업로드", description = "모임 이미지를 S3에 업로드하고 URL을 반환합니다.")
    @PostMapping("/image")
    public ResponseEntity<com.aidea.backend.domain.user.dto.UpdateProfileImageResponse> uploadImage(
            @RequestParam("image") MultipartFile image) {
        String imageUrl = meetingService.uploadMeetingImage(image);
        return ResponseEntity.ok(new com.aidea.backend.domain.user.dto.UpdateProfileImageResponse(imageUrl));
    }
}