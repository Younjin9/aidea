package com.aidea.backend.domain.chat.controller;

import com.aidea.backend.domain.chat.dto.request.ChatMessageRequest;
import com.aidea.backend.domain.chat.dto.response.ChatMessageResponse;
import com.aidea.backend.domain.chat.dto.response.ChatRoomResponse;
import com.aidea.backend.domain.chat.service.ChatService;
import com.aidea.backend.domain.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 채팅 Controller
 * - WebSocket (STOMP) 메시지 처리
 * - REST API (채팅 이력 조회)
 */
@Tag(name = "Chat", description = "채팅 API")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    // ========== WebSocket (STOMP) ==========

    /**
     * 채팅 메시지 전송
     * - 클라이언트: /app/chat.send.{meetingId}
     * - 브로드캐스트: /topic/meeting/{meetingId}
     */
    @MessageMapping("/chat.send.{meetingId}")
    @SendTo("/topic/meeting/{meetingId}")
    public ChatMessageResponse sendMessage(
            @Payload ChatMessageRequest request,
            @DestinationVariable Long meetingId,
            SimpMessageHeaderAccessor headerAccessor) {

        // TODO: WebSocket 인증 구현 후 실제 userId 추출
        // Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");
        Long userId = 1L;

        // meetingId 설정 (Path와 Request 일치 보장)
        request.setMeetingId(meetingId);

        // 입장 메시지 처리
        if (com.aidea.backend.domain.chat.entity.ChatMessage.MessageType.ENTER.equals(request.getMessageType())) {
            request.setMessage(request.getMessage() + "님이 입장하셨습니다.");
        }

        // 메시지 저장 및 브로드캐스트
        return chatService.saveMessage(request, userId);
    }

    // ========== REST API ==========

    /**
     * 채팅방 생성 (모임 생성 시 자동 호출)
     */
    @Operation(summary = "채팅방 생성", description = "모임에 대한 채팅방을 생성합니다")
    @PostMapping("/rooms")
    public ResponseEntity<Void> createChatRoom(@RequestParam Long meetingId) {
        chatService.createChatRoomForMeeting(meetingId);
        return ResponseEntity.ok().build();
    }

    /**
     * 내 채팅방 목록 조회
     */
    @Operation(summary = "내 채팅방 목록 조회", description = "참여 중인 모임의 채팅방 목록을 조회합니다")
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomResponse>> getChatRooms() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                .getName();
        com.aidea.backend.domain.user.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<ChatRoomResponse> response = chatService.getMyChatRooms(user.getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * 채팅 메시지 이력 조회
     */
    @Operation(summary = "채팅 메시지 조회", description = "채팅방의 최근 메시지를 조회합니다")
    @GetMapping("/meetings/{meetingId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable Long meetingId,
            @RequestParam(defaultValue = "50") int limit) {

        List<ChatMessageResponse> messages = chatService.getRecentMessages(meetingId, limit);
        return ResponseEntity.ok(messages);
    }

    /**
     * 메시지 읽음 처리 (Stub)
     */
    @Operation(summary = "메시지 읽음 처리", description = "채팅방 메시지를 읽음으로 처리합니다")
    @PostMapping("/rooms/{meetingId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long meetingId) {
        // TODO: 실제 읽음 처리 로직 구현 (Redis or DB)
        return ResponseEntity.ok().build();
    }
}
