package com.aidea.backend.domain.interest.initializer;

import com.aidea.backend.domain.interest.entity.Interest;
import com.aidea.backend.domain.interest.repository.InterestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class InterestDataInitializer implements CommandLineRunner {

  private final InterestRepository interestRepository;

  @Override
  @Transactional
  public void run(String... args) throws Exception {
    if (interestRepository.count() > 0) {
      log.info("Interests already initialized. Skipping.");
      return;
    }

    log.info("Initializing Interest data...");
    Map<String, List<String>> interestMap = getInterestData();

    for (Map.Entry<String, List<String>> entry : interestMap.entrySet()) {
      String category = entry.getKey();
      List<String> interests = entry.getValue();

      for (String interestName : interests) {
        if (interestRepository.findByInterestName(interestName).isEmpty()) {
          interestRepository.save(Interest.builder()
              .category(category)
              .interestName(interestName)
              .build());
        }
      }
    }
    log.info("Interest data initialization completed.");
  }

  private Map<String, List<String>> getInterestData() {
    Map<String, List<String>> data = new LinkedHashMap<>();

    // 1. 취미 / 여가
    data.put("취미 / 여가", Arrays.asList(
        "만들기 / DIY", "보드게임 / 퍼즐", "사진 / 기록", "글쓰기 / 독서", "취미 공유", "체험 활동"));

    // 2. 운동 / 액티비티
    data.put("운동 / 액티비티", Arrays.asList(
        "가벼운 운동", "야외 활동", "팀 스포츠", "개인 운동", "도전 / 챌린지"));

    // 3. 문화 / 예술
    data.put("문화 / 예술", Arrays.asList(
        "전시 / 관람", "창작 활동", "예술 취향 공유", "공연 / 행사", "디자인 / 미감"));

    // 4. 자기계발 / 공부
    data.put("자기계발 / 공부", Arrays.asList(
        "스터디", "습관 형성", "지식 공유", "목표 관리", "커리어 탐색"));

    // 5. 여행 / 나들이
    data.put("여행 / 나들이", Arrays.asList(
        "근교 나들이", "산책 / 걷기", "맛집 탐방", "기록 여행", "테마 여행"));

    // 6. 콘텐츠 / 미디어
    data.put("콘텐츠 / 미디어", Arrays.asList(
        "영화 / 드라마", "애니 / 만화", "게임", "유튜브 / 스트리밍", "콘텐츠 토크"));

    return data;
  }
}
