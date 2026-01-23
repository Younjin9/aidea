package com.aidea.backend.domain.recommendation.dto;

import com.aidea.backend.domain.meeting.entity.Meeting;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 추천 점수와 함께 모임 정보를 담는 내부 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingRecommendationDto implements Comparable<MeetingRecommendationDto> {

  private Meeting meeting;
  private double score;
  private String reason; // 추천 이유 (디버깅용)

  @Override
  public int compareTo(MeetingRecommendationDto other) {
    // 점수가 높은 순으로 정렬
    return Double.compare(other.score, this.score);
  }
}
