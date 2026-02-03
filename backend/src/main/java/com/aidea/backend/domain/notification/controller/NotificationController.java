package com.aidea.backend.domain.notification.controller;

import com.aidea.backend.domain.notification.dto.response.NotificationListResponse;
import com.aidea.backend.domain.notification.dto.response.NotificationReadResponse;
import com.aidea.backend.domain.notification.dto.response.UnreadCountResponse;
import com.aidea.backend.domain.notification.service.NotificationService;
import com.aidea.backend.domain.user.dto.UserResponse;
import com.aidea.backend.domain.user.service.UserService;
import com.aidea.backend.global.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 알림 API Controller
 */
@Tag(name = "Notification", description = "알림 API")
@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    /**
     * 사용자 알림 목록 조회
     */
    @Operation(summary = "알림 목록 조회", description = "사용자의 모든 알림 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<NotificationListResponse>> getNotifications(
            Authentication authentication) {

        String email = authentication.getName();
        log.info("알림 목록 조회 요청: email={}", email);

        UserResponse userResponse = userService.getMyProfile(email);
        Long userId = Long.parseLong(userResponse.getUserId());

        NotificationListResponse notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    /**
     * 알림 읽음 처리
     */
    @Operation(summary = "알림 읽음 처리", description = "특정 알림을 읽음 처리합니다.")
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationReadResponse>> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        log.info("알림 읽음 처리 요청: notificationId={}, email={}", id, email);

        UserResponse userResponse = userService.getMyProfile(email);
        Long userId = Long.parseLong(userResponse.getUserId());

        NotificationReadResponse response = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 전체 알림 읽음 처리
     */
    @Operation(summary = "전체 알림 읽음 처리", description = "사용자의 모든 알림을 읽음 처리합니다.")
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<NotificationReadResponse>> markAllAsRead(
            Authentication authentication) {

        String email = authentication.getName();
        log.info("전체 알림 읽음 처리 요청: email={}", email);

        UserResponse userResponse = userService.getMyProfile(email);
        Long userId = Long.parseLong(userResponse.getUserId());

        NotificationReadResponse response = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 안 읽은 알림 개수 조회
     */
    @Operation(summary = "안 읽은 알림 개수 조회", description = "사용자의 안 읽은 알림 개수만 조회합니다.")
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount(
            Authentication authentication) {

        String email = authentication.getName();
        log.info("안 읽은 알림 개수 조회 요청: email={}", email);

        UserResponse userResponse = userService.getMyProfile(email);
        Long userId = Long.parseLong(userResponse.getUserId());

        UnreadCountResponse response = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
