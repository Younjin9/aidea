package com.aidea.backend.domain.chat.exception;

/**
 * 채팅방을 찾을 수 없을 때 발생하는 예외
 */
public class ChatRoomNotFoundException extends RuntimeException {

    public ChatRoomNotFoundException(Long meetingId) {
        super(String.format("채팅방을 찾을 수 없습니다. meetingId: %d", meetingId));
    }

    public ChatRoomNotFoundException(String message) {
        super(message);
    }
}
