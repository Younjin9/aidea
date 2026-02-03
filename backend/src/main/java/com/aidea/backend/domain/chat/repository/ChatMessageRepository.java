package com.aidea.backend.domain.chat.repository;

import com.aidea.backend.domain.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    long countByChatRoomId(Long chatRoomId);

    void deleteByChatRoomId(Long chatRoomId);

    /**
     * 여러 채팅방의 메시지 전체 일괄 삭제
     */
    @Modifying
    @Query("DELETE FROM ChatMessage cm WHERE cm.chatRoom.id IN :chatRoomIds")
    void deleteByChatRoomIdIn(@Param("chatRoomIds") List<Long> chatRoomIds);
}
