package com.aidea.backend.domain.interest.controller;

import com.aidea.backend.domain.interest.dto.InterestDto;
import com.aidea.backend.domain.interest.service.InterestService;
import com.aidea.backend.global.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Interest", description = "관심사 관련 API")
@RestController
@RequestMapping("/api/interests")
@RequiredArgsConstructor
public class InterestController {

  private final InterestService interestService;

  @Operation(summary = "전체 관심사 조회", description = "카테고리별로 그룹화된 전체 관심사 목록을 반환합니다.")
  @GetMapping
  public ResponseEntity<ApiResponse<List<InterestDto.GroupedInterestResponse>>> getAllInterests() {
    return ResponseEntity.ok(ApiResponse.success(interestService.getAllInterestsGrouped()));
  }

  @Operation(summary = "관심사 카테고리 목록 조회", description = "관심사 카테고리 목록을 반환합니다.")
  @GetMapping("/categories")
  public ResponseEntity<ApiResponse<List<InterestDto.CategoryResponse>>> getInterestCategories() {
    return ResponseEntity.ok(ApiResponse.success(interestService.getInterestCategories()));
  }
}
