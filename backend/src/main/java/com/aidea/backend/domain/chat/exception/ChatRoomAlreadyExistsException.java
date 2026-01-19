package com.aidea.backend.domain.chat.exception;

/**
 * 채팅방이 이미 존재할 때 발생하는 예외
 */
public class ChatRoomAlreadyExistsException extends RuntimeException {

    public ChatRoomAlreadyExistsException(Long meetingId) {
        super(String.format("이미 채팅방이 존재합니다. meetingId: %d", meetingId));
    }
}
