package com.aidea.backend.domain.meeting.controller;

import com.aidea.backend.domain.meeting.dto.request.CreateMeetingRequest;
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
}
