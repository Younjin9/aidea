package com.aidea.backend.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class UserInterestDto {

  @Schema(description = "관심사 이름 목록", example = "[\"축구\", \"등산\"]")
  private List<String> interests;

  public UserInterestDto(List<String> interests) {
    this.interests = interests;
  }
}
