package com.aidea.backend.domain.safety.dto.request;

import com.aidea.backend.domain.safety.entity.enums.ReportReason;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReportUserRequest {
  private Long targetUserId;
  private ReportReason reason;
  private String detail;
}
