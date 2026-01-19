package com.aidea.backend.domain.chat.entity;

import com.aidea.backend.domain.meeting.entity.Meeting;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 채팅방 엔티티
 * - 모임별로 1개의 채팅방 생성
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "chat_room")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 모임 (1:1 관계)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false, unique = true)
    private Meeting meeting;

    // 생성 시간
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ========== 생성자 ==========
    @Builder
    public ChatRoom(Meeting meeting) {
        this.meeting = meeting;
    }

    // ========== 정적 팩토리 메서드 ==========
    public static ChatRoom createForMeeting(Meeting meeting) {
        return ChatRoom.builder()
                .meeting(meeting)
                .build();
    }
}
