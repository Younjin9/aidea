package com.aidea.backend.domain.meeting.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "meeting_hobby")
@IdClass(MeetingHobbyId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MeetingHobby {

    @Id
    @Column(name = "meeting_id", nullable = false)
    private Long meetingId;

    @Id
    @Column(name = "hobby_id", nullable = false)
    private Long hobbyId;

    public MeetingHobby(Long meetingId, Long hobbyId) {
        this.meetingId = meetingId;
        this.hobbyId = hobbyId;
    }
}