package com.aidea.backend.domain.notification.entity;

import com.aidea.backend.domain.notification.entity.enums.NotificationType;
import com.aidea.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 알림 엔티티
 */
@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@ToString(exclude = {"user"})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private NotificationType type;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

@Column(name = "is_read", nullable = false)
    private Boolean isRead;

    @Column(name = "related_group_id")
    private Long relatedGroupId;

    @Column(name = "related_user_id")
    private Long relatedUserId;

    @Column(name = "related_event_id")
    private Long relatedEventId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Notification(User user, NotificationType type, String title, String message,
                      Long relatedGroupId, Long relatedUserId, Long relatedEventId) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.message = message;
        this.isRead = false;
        this.relatedGroupId = relatedGroupId;
        this.relatedUserId = relatedUserId;
        this.relatedEventId = relatedEventId;
    }

    /**
     * 알림 읽음 처리
     */
    public void markAsRead() {
        this.isRead = true;
    }

    /**
     * 알림 읽음 여부 확인
     */
    public boolean isRead() {
        return this.isRead;
    }

    /**
     * 안 읽은 알림 여부 확인
     */
    public boolean isUnread() {
        return !this.isRead;
    }
}
