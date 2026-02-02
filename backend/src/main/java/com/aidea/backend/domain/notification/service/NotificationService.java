package com.aidea.backend.domain.notification.service;

import com.aidea.backend.domain.notification.dto.response.*;
import com.aidea.backend.domain.notification.entity.Notification;
import com.aidea.backend.domain.notification.entity.enums.NotificationType;
import com.aidea.backend.domain.notification.repository.NotificationRepository;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 알림 비즈니스 로직
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * 사용자 알림 목록 조회
     */
    public NotificationListResponse getUserNotifications(Long userId) {
        log.info("알림 목록 조회: userId={}", userId);

        List<Notification> notifications = notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        int totalCount = notificationRepository.countByUser_UserId(userId);
        int unreadCount = notificationRepository.countByUser_UserIdAndIsReadFalse(userId);

        List<NotificationResponse> notificationResponses = notifications.stream()
                .map(this::toNotificationResponse)
                .collect(Collectors.toList());

        return NotificationListResponse.builder()
                .notifications(notificationResponses)
                .totalCount(totalCount)
                .unreadCount(unreadCount)
                .build();
    }

    /**
     * 알림 읽음 처리
     */
    @Transactional
    public NotificationReadResponse markAsRead(Long notificationId, Long userId) {
        log.info("알림 읽음 처리: notificationId={}, userId={}", notificationId, userId);

        // 알림 소유권 확인
        Notification notification = notificationRepository.findByNotificationIdAndUser_UserId(notificationId, userId)
                .orElseThrow(() -> new RuntimeException("알림을 찾을 수 없거나 권한이 없습니다."));

        if (notification.isRead()) {
            return NotificationReadResponse.builder()
                    .success(false)
                    .message("이미 읽은 알림입니다.")
                    .build();
        }

        int updated = notificationRepository.markAsRead(notificationId, userId);
        if (updated > 0) {
            return NotificationReadResponse.builder()
                    .success(true)
                    .message("알림을 읽음 처리했습니다.")
                    .build();
        } else {
            return NotificationReadResponse.builder()
                    .success(false)
                    .message("알림 처리에 실패했습니다.")
                    .build();
        }
    }

    /**
     * 전체 알림 읽음 처리
     */
    @Transactional
    public NotificationReadResponse markAllAsRead(Long userId) {
        log.info("전체 알림 읽음 처리: userId={}", userId);

        int updated = notificationRepository.markAllAsRead(userId);
        
        return NotificationReadResponse.builder()
                .success(true)
                .message(String.format("%d개의 알림을 읽음 처리했습니다.", updated))
                .build();
    }

    /**
     * 안 읽은 알림 개수 조회
     */
    public UnreadCountResponse getUnreadCount(Long userId) {
        log.info("안 읽은 알림 개수 조회: userId={}", userId);

        int unreadCount = notificationRepository.countByUser_UserIdAndIsReadFalse(userId);

        return UnreadCountResponse.builder()
                .unreadCount(unreadCount)
                .build();
    }

    /**
     * 알림 생성
     */
    @Transactional
    public Notification createNotification(Long userId, NotificationType type, String title, String message,
                                       Long relatedGroupId, Long relatedUserId, Long relatedEventId) {
        log.info("알림 생성: userId={}, type={}", userId, type);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 사용자 알림 설정 확인
        if (!shouldSendNotification(user, type)) {
            log.info("알림 설정으로 인해 알림 전송 안 함: userId={}, type={}", userId, type);
            return null;
        }

        Notification notification = new Notification(user, type, title, message,
                relatedGroupId, relatedUserId, relatedEventId);

        return notificationRepository.save(notification);
    }

    /**
     * 알림 Entity를 Response DTO로 변환
     */
    private NotificationResponse toNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getNotificationId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .relatedGroupId(notification.getRelatedGroupId())
                .relatedUserId(notification.getRelatedUserId())
                .relatedEventId(notification.getRelatedEventId())
                .build();
    }

    /**
     * 사용자 알림 설정에 따라 알림 발송 여부 결정
     */
    private boolean shouldSendNotification(User user, NotificationType type) {
        // TODO: 사용자 알림 설정에 따라 필터링 로직
        // 예: 채팅 알림 비활성화된 경우 CHAT_MESSAGE 타입 알림 미발송
        return true;
    }
}
