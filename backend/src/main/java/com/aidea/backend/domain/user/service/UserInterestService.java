package com.aidea.backend.domain.user.service;

import com.aidea.backend.domain.interest.entity.Interest;
import com.aidea.backend.domain.interest.repository.InterestRepository;
import com.aidea.backend.domain.user.dto.UserInterestDto;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.entity.UserInterest;
import com.aidea.backend.domain.user.repository.UserInterestRepository;
import com.aidea.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserInterestService {

  private final UserRepository userRepository;
  private final InterestRepository interestRepository;
  private final UserInterestRepository userInterestRepository;

  /**
   * 사용자의 관심사를 설정합니다. (기존 관심사 초기화 후 재설정)
   */
  public void updateUserInterests(String email, UserInterestDto request) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    // 1. 기존 관심사 삭제
    userInterestRepository.deleteAllByUser(user);

    // 2. 새로운 관심사 조회
    if (request.getInterests() != null && !request.getInterests().isEmpty()) {
      List<Interest> interests = request.getInterests().stream()
          .map(name -> interestRepository.findByInterestName(name)
              .orElseThrow(() -> new IllegalArgumentException("Interest not found: " + name)))
          .collect(Collectors.toList());

      // 3. 새로운 관심사 저장
      List<UserInterest> userInterests = interests.stream()
          .map(interest -> UserInterest.builder()
              .user(user)
              .interest(interest)
              .build())
          .collect(Collectors.toList());

      userInterestRepository.saveAll(userInterests);
    }
  }
}
