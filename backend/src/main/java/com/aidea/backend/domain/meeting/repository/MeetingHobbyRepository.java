package com.aidea.backend.domain.meeting.repository;

import com.aidea.backend.domain.meeting.entity.MeetingHobby;
import com.aidea.backend.domain.meeting.entity.MeetingHobbyId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingHobbyRepository extends JpaRepository<MeetingHobby, MeetingHobbyId> {
}