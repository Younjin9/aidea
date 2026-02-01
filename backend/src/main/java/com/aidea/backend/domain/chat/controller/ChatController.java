package com.aidea.backend.domain.chat.controller;

import com.aidea.backend.domain.chat.dto.request.ChatMessageRequest;
import com.aidea.backend.domain.chat.dto.response.ChatMessageResponse;
import com.aidea.backend.domain.chat.dto.response.ChatRoomResponse;
import com.aidea.backend.domain.chat.service.ChatService;
import com.aidea.backend.domain.user.repository.UserRepository;
import com.aidea.backend.global.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Chat", description = "채팅 API")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/send/{meetingId}")
    public void sendMessage(
            @Payload ChatMessageRequest request,
            @DestinationVariable Long meetingId,
            Principal principal) {

        if (principal == null) {
            throw new RuntimeException("인증되지 않은 사용자입니다.");
        }

        String email = principal.getName();
        com.aidea.backend.domain.user.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Long userId = user.getUserId();

        request.setMeetingId(meetingId);

        if (com.aidea.backend.domain.chat.entity.ChatMessage.MessageType.ENTER.equals(request.getMessageType())) {
            request.setMessage(user.getNickname() + "님이 입장하셨습니다.");
        }

        ChatMessageResponse response = chatService.saveMessage(request, userId);
        messagingTemplate.convertAndSend("/topic/meeting/" + meetingId, response);
    }

    @Operation(summary = "채팅방 생성", description = "모임에 대한 채팅방을 생성합니다")
    @PostMapping("/rooms")
    public ResponseEntity<Void> createChatRoom(@RequestParam Long meetingId) {
        chatService.createChatRoomForMeeting(meetingId);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getChatRooms() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName().equals("anonymousUser")) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        String email = auth.getName();
        com.aidea.backend.domain.user.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<ChatRoomResponse> response = chatService.getMyChatRooms(user.getUserId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "채팅 메시지 조회", description = "채팅방의 최근 메시지를 조회합니다")
    @GetMapping("/meetings/{meetingId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(
            @PathVariable Long meetingId,
            @RequestParam(defaultValue = "50") int limit) {

        List<ChatMessageResponse> messages = chatService.getRecentMessages(meetingId, limit);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @Operation(summary = "메시지 읽음 처리", description = "채팅방 메시지를 읽음으로 처리합니다")
    @PostMapping("/rooms/{meetingId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long meetingId) {
        return ResponseEntity.ok().build();
    }
}
