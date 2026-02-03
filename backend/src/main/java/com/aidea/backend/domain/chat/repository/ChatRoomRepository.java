package com.aidea.backend.domain.chat.repository;

import com.aidea.backend.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

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

    /**
     * 여러 모임의 채팅방 ID 목록 조회
     */
    @Query("SELECT cr.id FROM ChatRoom cr WHERE cr.meeting.id IN :meetingIds")
    List<Long> findIdsByMeetingIdIn(@Param("meetingIds") List<Long> meetingIds);

    /**
     * 여러 모임의 채팅방 일괄 삭제
     */
    @Modifying
    @Query("DELETE FROM ChatRoom cr WHERE cr.meeting.id IN :meetingIds")
    void deleteByMeetingIdIn(@Param("meetingIds") List<Long> meetingIds);
}
