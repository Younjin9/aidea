package com.aidea.backend.domain.safety.dto.response;

import com.aidea.backend.domain.safety.entity.Report;
import com.aidea.backend.domain.safety.entity.enums.ReportReason;
import com.aidea.backend.domain.safety.entity.enums.ReportStatus;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReportResponse {
  private Long reportId;
  private Long reporterId;
  private Long targetUserId;
  private ReportReason reason;
  private String detail;
  private ReportStatus status;
  private LocalDateTime createdAt;

  public static ReportResponse from(Report report) {
    return ReportResponse.builder()
        .reportId(report.getId())
        .reporterId(report.getReporter().getUserId())
        .targetUserId(report.getTargetUser().getUserId())
        .reason(report.getReason())
        .detail(report.getDetail())
        .status(report.getStatus())
        .createdAt(report.getCreatedAt())
        .build();
  }
}
