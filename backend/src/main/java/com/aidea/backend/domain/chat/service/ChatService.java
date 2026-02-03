package com.aidea.backend.domain.chat.service;

import com.aidea.backend.domain.chat.dto.request.ChatMessageRequest;
import com.aidea.backend.domain.chat.dto.response.ChatMessageResponse;
import com.aidea.backend.domain.chat.dto.response.ChatRoomResponse;
import com.aidea.backend.domain.chat.entity.ChatMessage;
import com.aidea.backend.domain.chat.entity.ChatRoom;
import com.aidea.backend.domain.chat.exception.ChatRoomAlreadyExistsException;
import com.aidea.backend.domain.chat.exception.ChatRoomNotFoundException;
import com.aidea.backend.domain.chat.repository.ChatMessageRepository;
import com.aidea.backend.domain.chat.repository.ChatRoomRepository;
import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.entity.MeetingMember;
import com.aidea.backend.domain.meeting.entity.enums.MemberStatus;
import com.aidea.backend.domain.meeting.repository.MeetingMemberRepository;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.repository.UserRepository;
import com.aidea.backend.domain.notification.service.NotificationService;
import com.aidea.backend.domain.notification.entity.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 채팅 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

        private final ChatRoomRepository chatRoomRepository;
        private final ChatMessageRepository chatMessageRepository;
        private final MeetingRepository meetingRepository;
        private final UserRepository userRepository;
        private final MeetingMemberRepository meetingMemberRepository;
        private final NotificationService notificationService;

        /**
         * 모임에 대한 채팅방 생성
         */
        @Transactional
        public ChatRoom createChatRoomForMeeting(Long meetingId) {
                // 1. 이미 채팅방이 있는지 확인
                if (chatRoomRepository.existsByMeetingId(meetingId)) {
                        throw new ChatRoomAlreadyExistsException(meetingId);
                }

                // 2. Meeting 조회
                Meeting meeting = meetingRepository.findById(meetingId)
                                .orElseThrow(() -> new RuntimeException("모임을 찾을 수 없습니다."));

                // 3. ChatRoom 생성
                ChatRoom chatRoom = ChatRoom.createForMeeting(meeting);
                return chatRoomRepository.save(chatRoom);
        }

        /**
         * 채팅 메시지 저장
         */
        @Transactional
        public ChatMessageResponse saveMessage(ChatMessageRequest request, Long userId) {
                // 1. ChatRoom 조회 (없으면 생성 시도)
                ChatRoom chatRoom = chatRoomRepository.findByMeetingId(request.getMeetingId())
                                .orElseGet(() -> {
                                        // ChatRoom이 없으면 Meeting 존재 여부 확인 후 생성
                                        Meeting meeting = meetingRepository.findById(request.getMeetingId())
                                                        .orElseThrow(() -> new ChatRoomNotFoundException(
                                                                        request.getMeetingId()));
                                        log.info("채팅방이 없어 신규 생성합니다. meetingId: {}", request.getMeetingId());
                                        return chatRoomRepository.save(ChatRoom.createForMeeting(meeting));
                                });

                // 2. User 조회
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                // 3. ChatMessage 생성 및 저장
                ChatMessage chatMessage = ChatMessage.builder()
                                .chatRoom(chatRoom)
                                .sender(user)
                                .message(request.getMessage())
                                .messageType(request.getMessageType())
                                .build();

                log.info("채팅 메시지 저장 시도: meetingId={}, sender={}, message={}", request.getMeetingId(), user.getEmail(),
                                request.getMessage());
                ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
                log.info("채팅 메시지 저장 완료: messageId={}", savedMessage.getId());

                // 4. ✅ 다른 멤버들에게 알림 생성 (실시간 채팅방에 없는 유저들을 위해)
                if (chatMessage.getMessageType() == ChatMessage.MessageType.TALK) {
                        List<MeetingMember> members = meetingMemberRepository.findByMeetingIdAndStatus(
                                        request.getMeetingId(), MemberStatus.APPROVED);

                        for (MeetingMember member : members) {
                                if (!member.getUser().getUserId().equals(userId)) {
                                        notificationService.createNotification(
                                                        member.getUser().getUserId(),
                                                        NotificationType.CHAT_MESSAGE,
                                                        "새 메시지: " + chatRoom.getMeeting().getTitle(),
                                                        user.getNickname() + ": " + request.getMessage(),
                                                        request.getMeetingId(),
                                                        userId,
                                                        null);
                                }
                        }
                }

                // 5. Response 반환
                return savedMessage.toResponse();
        }

        /**
         * 채팅방의 최근 메시지 조회
         */
        @Transactional
        public List<ChatMessageResponse> getRecentMessages(Long meetingId, Long userId, int limit) {
                // 1. 멤버십 확인 (보안)
                if (!meetingMemberRepository.existsByMeetingIdAndUser_UserIdAndStatus(meetingId, userId,
                                MemberStatus.APPROVED)) {
                        throw new RuntimeException("모임 멤버만 채팅을 볼 수 있습니다."); // Global Exception Handler should map this
                                                                            // or specific exception
                }

                // 2. ChatRoom 조회 (없으면 생성 시도)
                ChatRoom chatRoom = chatRoomRepository.findByMeetingId(meetingId)
                                .orElseGet(() -> {
                                        // ChatRoom이 없으면 Meeting 존재 여부 확인 후 생성
                                        Meeting meeting = meetingRepository.findById(meetingId)
                                                        .orElseThrow(() -> new ChatRoomNotFoundException(meetingId));
                                        return chatRoomRepository.save(ChatRoom.createForMeeting(meeting));
                                });

                // 2. 최근 메시지 조회
                List<ChatMessage> messages = limit <= 50
                                ? chatMessageRepository.findTop50ByChatRoomIdOrderByCreatedAtDesc(chatRoom.getId())
                                : chatMessageRepository.findByChatRoomIdOrderByCreatedAtDesc(chatRoom.getId());

                // 3. Response 변환 (역순으로 정렬 - 오래된 것부터)
                return messages.stream()
                                .map(ChatMessage::toResponse)
                                .collect(Collectors.toList());
        }

        /**
         * 내 채팅방 목록 조회
         */
        public List<ChatRoomResponse> getMyChatRooms(Long userId) {
                // 1. 내가 참여 중인 모임 조회
                List<MeetingMember> myMeetings = meetingMemberRepository.findByUser_UserIdAndStatusNot(userId,
                                MemberStatus.LEFT);

                return myMeetings.stream()
                                .map(member -> {
                                        Meeting meeting = member.getMeeting();
                                        // ChatRoom 조회 (없으면 생성? 조회 리스트에서는 생성 안하는게 나을수도 있지만, 채팅방이 있어야 함)
                                        // 보통 모임 생성시 채팅방 생성됨. 없으면 null 처리하거나 생성.
                                        ChatRoom chatRoom = chatRoomRepository.findByMeetingId(meeting.getId())
                                                        .orElse(null);

                                        if (chatRoom == null)
                                                return null;

                                        // 마지막 메시지 조회
                                        ChatMessage lastMessage = chatMessageRepository
                                                        .findTopByChatRoomIdOrderByCreatedAtDesc(chatRoom.getId())
                                                        .orElse(null);

                                        return ChatRoomResponse.builder()
                                                        .chatRoomId(chatRoom.getId())
                                                        .meetingId(meeting.getId())
                                                        .meetingTitle(meeting.getTitle())
                                                        .meetingImage(meeting.getImageUrl())
                                                        .lastMessage(lastMessage != null ? lastMessage.getMessage()
                                                                        : null)
                                                        .lastMessageTime(
                                                                        lastMessage != null ? lastMessage.getCreatedAt()
                                                                                        : null)
                                                        .unreadCount(0) // TODO: 읽음 처리 로직 구현 필요
                                                        .participantCount(meeting.getCurrentMembers())
                                                        .build();
                                })
                                .filter(java.util.Objects::nonNull)
                                .sorted((c1, c2) -> {
                                        if (c1.getLastMessageTime() == null)
                                                return 1;
                                        if (c2.getLastMessageTime() == null)
                                                return -1;
                                        return c2.getLastMessageTime().compareTo(c1.getLastMessageTime());
                                })
                                .collect(Collectors.toList());
        }

        /**
         * 채팅방 삭제 (모임 삭제 시)
         */
        @Transactional
        public void deleteChatRoom(Long meetingId) {
                chatRoomRepository.findByMeetingId(meetingId)
                                .ifPresent(chatRoomRepository::delete);
        }

        /**
         * 채팅방 조회 (존재 여부 확인용)
         */
        public ChatRoom getChatRoomByMeetingId(Long meetingId) {
                return chatRoomRepository.findByMeetingId(meetingId)
                                .orElseThrow(() -> new ChatRoomNotFoundException(meetingId));
        }
}
