package com.aidea.backend.domain.chat.dto.response;

import com.aidea.backend.domain.chat.entity.ChatMessage.MessageType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 응답 DTO
 */
@Getter
@Builder
public class ChatMessageResponse {

    private Long messageId; // 메시지 ID
    private Long senderId; // 발신자 ID
    private String senderNickname; // 발신자 닉네임
    private String senderProfileImage; // 발신자 프로필 이미지
    private String message; // 메시지 내용
    private MessageType messageType; // 메시지 타입
    private LocalDateTime createdAt; // 전송 시간
}
