package com.aidea.backend.domain.user.controller;

import com.aidea.backend.domain.user.dto.UserInterestDto;
import com.aidea.backend.domain.user.service.UserInterestService;
import com.aidea.backend.global.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User Interest", description = "사용자 관심사 API")
@RestController
@RequestMapping("/api/v1/users/interests")
@RequiredArgsConstructor
public class UserInterestController {

  private final UserInterestService userInterestService;

  @Operation(summary = "관심사 설정", description = "사용자의 관심사를 설정합니다. 기존 관심사는 삭제되고 새로운 목록으로 대체됩니다.")
  @PutMapping
  public ResponseEntity<ApiResponse<String>> updateUserInterests(
      Authentication authentication,
      @RequestBody UserInterestDto request) {

    userInterestService.updateUserInterests(authentication.getName(), request);
    return ResponseEntity.ok(ApiResponse.success("관심사가 저장되었습니다."));
  }
}
