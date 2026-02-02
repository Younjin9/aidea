package com.aidea.backend.domain.notification.repository;

import com.aidea.backend.domain.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * 특정 사용자의 모든 알림 목록 조회 (최신순)
     */
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * 특정 사용자의 읽지 않은 알림 목록 조회 (최신순)
     */
    List<Notification> findByUser_UserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    /**
     * 특정 사용자의 총 알림 개수 조회
     */
    int countByUser_UserId(Long userId);
    
    /**
     * 특정 사용자의 읽지 않은 알림 개수 조회
     */
    int countByUser_UserIdAndIsReadFalse(Long userId);
    
    /**
     * 특정 알림 조회 (사용자 소유 확인용)
     */
    Optional<Notification> findByNotificationIdAndUser_UserId(Long notificationId, Long userId);
    
    /**
     * 특정 알림 읽음 처리
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.notificationId = :notificationId AND n.user.userId = :userId")
    int markAsRead(@Param("notificationId") Long notificationId, @Param("userId") Long userId);
    
    /**
     * 특정 사용자의 모든 알림 읽음 처리
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.userId = :userId")
    int markAllAsRead(@Param("userId") Long userId);
}
