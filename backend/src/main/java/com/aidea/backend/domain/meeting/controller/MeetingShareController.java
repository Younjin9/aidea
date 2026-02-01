package com.aidea.backend.domain.meeting.controller;

import com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse;
import com.aidea.backend.domain.meeting.dto.response.ShareCreationResponse;
import com.aidea.backend.domain.meeting.service.MeetingShareService;
import com.aidea.backend.domain.user.repository.UserRepository;
import com.aidea.backend.global.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Meeting Share", description = "모임 공유 API")
@RestController
@RequiredArgsConstructor
public class MeetingShareController {

    private final MeetingShareService meetingShareService;
    private final UserRepository userRepository;

    // Helper to get current user ID
    private Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null)
                return null;
            String email = auth.getName();
            if (email == null || email.equals("anonymousUser"))
                return null;

            return userRepository.findByEmail(email)
                    .map(com.aidea.backend.domain.user.entity.User::getUserId)
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    @Operation(summary = "모임 공유 링크 생성", description = "모임을 공유하기 위한 24시간 유효 랜덤 링크를 생성합니다.")
    @PostMapping("/api/groups/{meetingId}/share")
    public ResponseEntity<ApiResponse<ShareCreationResponse>> createShareLink(@PathVariable Long meetingId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("로그인이 필요합니다."));
        }

        try {
            ShareCreationResponse response = meetingShareService.createShareLink(meetingId, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "공유된 모임 정보 조회 (Public)", description = "공유 토큰으로 모임 정보를 조회합니다. (로그인 불필요)")
    @GetMapping("/api/share/{token}")
    public ResponseEntity<ApiResponse<MeetingSummaryResponse>> getSharedMeeting(@PathVariable String token) {
        try {
            MeetingSummaryResponse response = meetingShareService.getMeetingByToken(token);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            // "만료된..." 메시지가 포함되면 410, 아니면 404
            if (e.getMessage().contains("만료")) {
                return ResponseEntity.status(HttpStatus.GONE).body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }
}
