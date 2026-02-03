package com.aidea.backend.domain.safety.service;

import com.aidea.backend.domain.safety.dto.request.ReportUserRequest;
import com.aidea.backend.domain.safety.dto.response.ReportResponse;
import com.aidea.backend.domain.safety.entity.Report;
import com.aidea.backend.domain.safety.repository.ReportRepository;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

  private final ReportRepository reportRepository;
  private final UserRepository userRepository;

  @Transactional
  public ReportResponse createReport(Long reporterId, ReportUserRequest request) {
    User reporter = userRepository.findById(reporterId)
        .orElseThrow(() -> new IllegalArgumentException("신고자를 찾을 수 없습니다."));

    User targetUser = userRepository.findById(request.getTargetUserId())
        .orElseThrow(() -> new IllegalArgumentException("신고 대상을 찾을 수 없습니다."));

    Report report = Report.builder()
        .reporter(reporter)
        .targetUser(targetUser)
        .reason(request.getReason())
        .detail(request.getDetail())
        .build();

    Report savedReport = reportRepository.save(report);

    return ReportResponse.from(savedReport);
  }
}
