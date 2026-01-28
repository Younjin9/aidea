package com.aidea.backend.domain.meeting.entity;

import com.aidea.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 모임 찜(좋아요) 엔티티
 * - User와 Meeting의 ManyToMany 관계를 위한 중간 테이블
 */
@Entity
@Table(name = "meeting_like",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_meeting_like", columnNames = {"user_id", "meeting_id"})
       })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@ToString(exclude = {"user", "meeting"})
public class MeetingLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "meeting_like_id")
    private Long meetingLikeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public MeetingLike(User user, Meeting meeting) {
        this.user = user;
        this.meeting = meeting;
    }
}