package com.aidea.backend.domain.meeting.entity;

import java.io.Serializable;
import java.util.Objects;

public class MeetingHobbyId implements Serializable {

    private Long meetingId;
    private Long hobbyId;

    public MeetingHobbyId() {}

    public MeetingHobbyId(Long meetingId, Long hobbyId) {
        this.meetingId = meetingId;
        this.hobbyId = hobbyId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MeetingHobbyId)) return false;
        MeetingHobbyId that = (MeetingHobbyId) o;
        return Objects.equals(meetingId, that.meetingId) &&
                Objects.equals(hobbyId, that.hobbyId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(meetingId, hobbyId);
    }
}