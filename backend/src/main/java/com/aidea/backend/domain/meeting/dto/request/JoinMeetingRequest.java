package com.aidea.backend.domain.meeting.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 모임 참가 신청 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class JoinMeetingRequest {
    private String requestMessage;
}
