package com.aidea.backend.domain.chat.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatRoomResponse {
    private Long chatRoomId;
    private Long meetingId;
    private String meetingTitle;
    private String meetingImage;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Integer unreadCount;
    private Integer participantCount;
}
