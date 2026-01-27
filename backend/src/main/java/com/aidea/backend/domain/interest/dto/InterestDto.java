package com.aidea.backend.domain.interest.dto;

import com.aidea.backend.domain.interest.entity.Interest;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

public class InterestDto {

  @Getter
  @Builder
  public static class InterestResponse {
    private Long interestId;
    private String interestName;
    private String category;

    public static InterestResponse from(Interest interest) {
      return InterestResponse.builder()
          .interestId(interest.getInterestId())
          .interestName(interest.getInterestName())
          .category(interest.getCategory())
          .build();
    }
  }

  @Getter
  @Builder
  public static class GroupedInterestResponse {
    private String category;
    private List<InterestResponse> interests;
  }
}
