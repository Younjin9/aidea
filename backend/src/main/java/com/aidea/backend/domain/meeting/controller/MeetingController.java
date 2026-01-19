package com.aidea.backend.domain.meeting.controller;

import com.aidea.backend.domain.meeting.dto.request.CreateMeetingRequest;
import com.aidea.backend.domain.meeting.dto.request.UpdateMeetingRequest;
import com.aidea.backend.domain.meeting.dto.response.MeetingResponse;
import com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse;
import com.aidea.backend.domain.meeting.service.MeetingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 모임 API Controller
 */
@Tag(name = "Meeting", description = "모임 API")
@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    /**
     * 모임 생성
     */
    @Operation(summary = "모임 생성", description = "새로운 모임을 생성합니다")
    @PostMapping
    public ResponseEntity<MeetingResponse> createMeeting(
            @Valid @RequestBody CreateMeetingRequest request) {
        // TODO: 인증 구현 후 실제 userId 사용
        Long userId = 1L; // 임시 하드코딩

        MeetingResponse response = meetingService.createMeeting(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 모임 상세 조회
     */
    @Operation(summary = "모임 상세 조회", description = "모임 ID로 상세 정보를 조회합니다")
    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponse> getMeeting(
            @PathVariable Long id) {
        MeetingResponse response = meetingService.getMeetingById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 모임 목록 조회 (페이징)
     */
    @Operation(summary = "모임 목록 조회", description = "모임 목록을 페이징하여 조회합니다")
    @GetMapping
    public ResponseEntity<Page<MeetingSummaryResponse>> getAllMeetings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MeetingSummaryResponse> response = meetingService.getAllMeetings(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 모임 검색 (조건별 통합 검색)
     * - category만 있음 → category 조회
     * - region만 있음 → region 조회
     * - 둘 다 있음 → category AND region 조회
     * - 둘 다 없음 → 전체 조회
     */
    @Operation(summary = "모임 검색", description = "카테고리, 지역 조건으로 모임을 검색합니다")
    @GetMapping("/search")
    public ResponseEntity<Page<MeetingSummaryResponse>> searchMeetings(
            @RequestParam(required = false) com.aidea.backend.domain.meeting.entity.enums.MeetingCategory category,
            @RequestParam(required = false) com.aidea.backend.domain.meeting.entity.enums.Region region,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MeetingSummaryResponse> response = meetingService.searchMeetings(category, region, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 모임 삭제
     */
    @Operation(summary = "모임 삭제", description = "모임을 삭제합니다 (HOST만 가능)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        Long userId = 1L; // TODO: 인증 구현 후 실제 userId 사용
        meetingService.deleteMeeting(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 모임 수정
     */
    @Operation(summary = "모임 수정", description = "모임 정보를 수정합니다 (HOST만 가능)")
    @PutMapping("/{id}")
    public ResponseEntity<MeetingResponse> updateMeeting(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMeetingRequest request) {
        Long userId = 1L; // TODO: 인증 구현 후 실제 userId 사용
        MeetingResponse response = meetingService.updateMeeting(id, userId, request);
        return ResponseEntity.ok(response);
    }

    // ========== 참가 관리 API ==========

    /**
     * 모임 참가 신청
     */
    @Operation(summary = "모임 참가 신청", description = "모임에 참가 신청합니다")
    @PostMapping("/{id}/join")
    public ResponseEntity<com.aidea.backend.domain.meeting.dto.response.MemberResponse> joinMeeting(
            @PathVariable Long id) {
        Long userId = 1L; // TODO: 인증 구현 후 실제 userId 사용
        com.aidea.backend.domain.meeting.dto.response.MemberResponse response = meetingService.joinMeeting(id, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 승인된 참가자 목록 조회
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
     * 대기 중인 참가 신청 목록 조회 (HOST 전용)
     */
    @Operation(summary = "참가 신청 목록 조회", description = "대기 중인 참가 신청 목록을 조회합니다 (HOST만 가능)")
    @GetMapping("/{id}/join-requests")
    public ResponseEntity<java.util.List<com.aidea.backend.domain.meeting.dto.response.JoinRequestResponse>> getPendingRequests(
            @PathVariable Long id) {
        Long userId = 1L; // TODO: 인증 구현 후 실제 userId 사용
        java.util.List<com.aidea.backend.domain.meeting.dto.response.JoinRequestResponse> response = meetingService
                .getPendingRequests(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 참가 신청 승인 (HOST 전용)
     */
    @Operation(summary = "참가 신청 승인", description = "참가 신청을 승인합니다 (HOST만 가능)")
    @PostMapping("/{id}/join-requests/{memberId}/approve")
    public ResponseEntity<com.aidea.backend.domain.meeting.dto.response.MemberResponse> approveJoinRequest(
            @PathVariable Long id,
            @PathVariable Long memberId) {
        Long userId = 1L; // TODO: 인증 구현 후 실제 userId 사용
        com.aidea.backend.domain.meeting.dto.response.MemberResponse response = meetingService.approveJoinRequest(id,
                memberId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 참가 신청 거절 (HOST 전용)
     */
    @Operation(summary = "참가 신청 거절", description = "참가 신청을 거절합니다 (HOST만 가능)")
    @PostMapping("/{id}/join-requests/{memberId}/reject")
    public ResponseEntity<Void> rejectJoinRequest(
            @PathVariable Long id,
            @PathVariable Long memberId) {
        Long userId = 1L; // TODO: 인증 구현 후 실제 userId 사용
        meetingService.rejectJoinRequest(id, memberId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 모임 탈퇴
     */
    @Operation(summary = "모임 탈퇴", description = "모임에서 탈퇴합니다")
    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leaveMeeting(@PathVariable Long id) {
        Long userId = 1L; // TODO: 인증 구현 후 실제 userId 사용
        meetingService.leaveMeeting(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 참가자 강제 퇴출 (HOST 전용)
     */
    @Operation(summary = "참가자 강제 퇴출", description = "참가자를 강제로 퇴출합니다 (HOST만 가능)")
    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long memberId) {
        Long userId = 1L; // TODO: 인증 구현 후 실제 userId 사용
        meetingService.removeMember(id, memberId, userId);
        return ResponseEntity.noContent().build();
    }
}
