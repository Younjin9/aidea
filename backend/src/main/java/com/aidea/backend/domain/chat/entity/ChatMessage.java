package com.aidea.backend.domain.chat.entity;

import com.aidea.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 엔티티
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 채팅방 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    // 발신자 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    // 메시지 내용 (한글 지원)
    @Column(nullable = false, columnDefinition = "TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String message;

    // 메시지 타입
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageType messageType;

    // 전송 시간
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ========== 생성자 ==========
    @Builder
    public ChatMessage(ChatRoom chatRoom, User sender, String message, MessageType messageType) {
        this.chatRoom = chatRoom;
        this.sender = sender;
        this.message = message;
        this.messageType = messageType;
    }

    // ========== DTO 변환 ==========
    public com.aidea.backend.domain.chat.dto.response.ChatMessageResponse toResponse() {
        return com.aidea.backend.domain.chat.dto.response.ChatMessageResponse.builder()
                .messageId(this.id)
                .senderId(this.sender.getUserId())
                .senderNickname(this.sender.getNickname())
                .senderProfileImage(this.sender.getProfileImage())
                .message(this.message)
                .messageType(this.messageType)
                .createdAt(this.createdAt)
                .build();
    }

    // ========== Enum ==========
    public enum MessageType {
        CHAT, // 일반 채팅
        JOIN, // 입장 알림
        LEAVE // 퇴장 알림
    }
}
