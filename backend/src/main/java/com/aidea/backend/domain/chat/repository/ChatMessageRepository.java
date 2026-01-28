package com.aidea.backend.domain.chat.repository;

import com.aidea.backend.domain.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 채팅 메시지 Repository
 */
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * 채팅방의 메시지 조회 (최신순)
     */
    List<ChatMessage> findByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId);

    /**
     * 채팅방의 최근 N개 메시지 조회
     */
    List<ChatMessage> findTop50ByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId);

    /**
     * 채팅방의 가장 최근 메시지 1개 조회
     */
    java.util.Optional<ChatMessage> findTopByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId);
}
