package com.aidea.backend.domain.meeting.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferHostRequest {
    private Long newHostUserId;
}
