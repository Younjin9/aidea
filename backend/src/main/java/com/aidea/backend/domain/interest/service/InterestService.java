package com.aidea.backend.domain.interest.service;

import com.aidea.backend.domain.interest.dto.InterestDto;
import com.aidea.backend.domain.interest.entity.Interest;
import com.aidea.backend.domain.interest.repository.InterestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InterestService {

  private final InterestRepository interestRepository;

  /**
   * 모든 관심사를 카테고리별로 그룹화하여 반환
   */
  public List<InterestDto.GroupedInterestResponse> getAllInterestsGrouped() {
    List<Interest> interests = interestRepository.findAll();

    Map<String, List<InterestDto.InterestResponse>> grouped = interests.stream()
        .map(InterestDto.InterestResponse::from)
        .collect(Collectors.groupingBy(InterestDto.InterestResponse::getCategory));

    return grouped.entrySet().stream()
        .map(entry -> InterestDto.GroupedInterestResponse.builder()
            .category(entry.getKey())
            .interests(entry.getValue())
            .build())
        .collect(Collectors.toList());
  }
}
