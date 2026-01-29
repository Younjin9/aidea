package com.aidea.backend.domain.chat.repository;

import com.aidea.backend.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    /**
     * 모임 ID로 채팅방 조회
     */
    Optional<ChatRoom> findByMeetingId(Long meetingId);

    /**
     * 모임 ID로 채팅방 존재 여부 확인
     */
    boolean existsByMeetingId(Long meetingId);

    /**
     * 모임 ID로 채팅방 삭제 (모임 삭제 시 사용)
     */
    void deleteByMeetingId(Long meetingId);
}
