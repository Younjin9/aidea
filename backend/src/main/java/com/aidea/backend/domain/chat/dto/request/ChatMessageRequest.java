package com.aidea.backend.domain.chat.dto.request;

import com.aidea.backend.domain.chat.entity.ChatMessage.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 채팅 메시지 전송 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class ChatMessageRequest {

    @NotNull(message = "모임 ID는 필수입니다")
    private Long meetingId;

    @NotBlank(message = "메시지는 필수입니다")
    private String message;

    @NotNull(message = "메시지 타입은 필수입니다")
    private MessageType messageType;
}
