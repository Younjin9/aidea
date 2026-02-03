package com.aidea.backend.domain.safety.controller;

import com.aidea.backend.domain.safety.dto.request.ReportUserRequest;
import com.aidea.backend.domain.safety.dto.response.ReportResponse;
import com.aidea.backend.domain.safety.service.ReportService;
import com.aidea.backend.global.common.dto.ApiResponse;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Safety Report", description = "안전(신고) 관련 API")
@RestController
@RequiredArgsConstructor
public class ReportController {

  private final ReportService reportService;
  private final UserRepository userRepository;

  private Long getCurrentUserId() {
    try {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      if (auth == null)
        return null;
      String email = auth.getName();
      if (email == null || email.equals("anonymousUser"))
        return null;

      return userRepository.findByEmail(email)
          .map(User::getUserId)
          .orElse(null);
    } catch (Exception e) {
      return null;
    }
  }

  @Operation(summary = "사용자 신고", description = "특정 사용자를 신고합니다.")
  @PostMapping("/api/safety/reports")
  public ResponseEntity<ApiResponse<ReportResponse>> createReport(@RequestBody ReportUserRequest request) {
    Long reporterId = getCurrentUserId();
    if (reporterId == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(ApiResponse.error("로그인이 필요합니다."));
    }

    try {
      ReportResponse response = reportService.createReport(reporterId, request);
      return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    }
  }
}
