package com.aidea.backend.domain.meeting.repository;

import com.aidea.backend.domain.meeting.entity.MeetingMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingMemberRepository extends JpaRepository<MeetingMember, Long> {
}
