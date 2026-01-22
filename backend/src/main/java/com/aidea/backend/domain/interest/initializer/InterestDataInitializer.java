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
    data.put("취미/여가", Arrays.asList(
        "공방/수공예", "뜨개질", "그림그리기", "악기연주", "요리/베이킹", "사진/영상", "반려동물"));

    // 2. 액티비티
    data.put("액티비티", Arrays.asList(
        "방탈출", "보드게임", "크라임씬", "놀이공원/테마파크", "VR체험", "볼링/당구"));

    // 3. 운동 / 스포츠
    data.put("운동/스포츠", Arrays.asList(
        "런닝/조깅", "축구", "농구", "배드민턴", "테니스", "클라이밍",
        "스키/보드", "수영", "헬스/크로스핏", "요가/필라테스", "자전거/라이딩"));

    // 4. 문화 / 예술
    data.put("문화/예술", Arrays.asList(
        "전시/미술관", "팝업스토어", "뮤지컬", "연극", "영화",
        "콘서트/페스티벌", "스탠드업 코미디", "스포츠 관람"));

    // 5. 스터디 / 자기계발
    data.put("스터디/자기계발", Arrays.asList(
        "외국어", "자격증", "코딩/개발", "커리어(취준/이직)",
        "자기계발(습관/목표)", "독서/책", "재테크/투자", "글쓰기/블로그"));

    // 6. 여행 / 나들이
    data.put("여행/나들이", Arrays.asList(
        "산책/걷기", "맛집 탐방", "카페 투어", "드라이브",
        "쇼핑", "근교 여행", "국내 여행", "해외 여행", "캠핑/차박"));

    // 7. 컨텐츠 / 미디어
    data.put("컨텐츠/미디어", Arrays.asList(
        "드라마/영화 토론", "애니메이션", "웹툰/만화", "PC/콘솔 게임"));

    return data;
  }
}
