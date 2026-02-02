package com.aidea.backend.domain.meeting.controller;

// import com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse;
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

    // 배포 오류 주석 추가
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

    @Operation(summary = "정모(일정) 공유 링크 생성", description = "정모(일정)을 공유하기 위한 링크를 생성합니다.")
    @PostMapping("/api/groups/{meetingId}/events/{eventId}/share")
    public ResponseEntity<ApiResponse<ShareCreationResponse>> createEventShareLink(@PathVariable Long meetingId,
            @PathVariable Long eventId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("로그인이 필요합니다."));
        }

        try {
            ShareCreationResponse response = meetingShareService.createEventShareLink(meetingId, eventId, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
