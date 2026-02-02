package com.aidea.backend.domain.meeting.entity;

import com.aidea.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "meeting_share", indexes = {
        @Index(name = "idx_share_token", columnList = "share_token", unique = true),
        @Index(name = "idx_expires_at", columnList = "expires_at"),
        @Index(name = "idx_meeting_user_expires", columnList = "meeting_id, user_id, expires_at")
})
public class MeetingShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "share_token", nullable = false, length = 20, unique = true)
    private String shareToken;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public MeetingShare(Meeting meeting, User user, String shareToken, LocalDateTime expiresAt) {
        this.meeting = meeting;
        this.user = user;
        this.shareToken = shareToken;
        this.expiresAt = expiresAt;
    }
}
