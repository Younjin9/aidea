package com.aidea.backend.domain.recommendation.vector;

import java.util.Map;

/**
 * hobby_name -> [activity, social, immersion]
 * (너희가 정한 벡터값 그대로)
 */
public final class HobbyVectorSeedData {

    private HobbyVectorSeedData() {}

    public static final Map<String, double[]> VECTORS = Map.ofEntries(
            // 1. 취미/여가
            Map.entry("공방/수공예", new double[]{0.4, 0.5, 0.7}),
            Map.entry("뜨개질", new double[]{0.2, 0.2, 0.6}),
            Map.entry("그림그리기", new double[]{0.2, 0.2, 0.8}),
            Map.entry("악기연주", new double[]{0.4, 0.3, 0.8}),
            Map.entry("요리/베이킹", new double[]{0.5, 0.4, 0.6}),
            Map.entry("사진/영상", new double[]{0.4, 0.3, 0.7}),
            Map.entry("반려동물", new double[]{0.5, 0.4, 0.4}),

            // 2. 액티비티(실내 놀이)
            Map.entry("방탈출", new double[]{0.6, 0.9, 0.7}),
            Map.entry("보드게임", new double[]{0.3, 0.8, 0.7}),
            Map.entry("크라임씬", new double[]{0.4, 0.9, 0.8}),
            Map.entry("놀이공원/테마파크", new double[]{0.8, 0.6, 0.2}),
            Map.entry("VR체험", new double[]{0.7, 0.4, 0.4}),
            Map.entry("볼링/당구", new double[]{0.5, 0.6, 0.4}),

            // 3. 운동/스포츠
            Map.entry("런닝/조깅", new double[]{0.8, 0.2, 0.3}),
            Map.entry("축구", new double[]{0.9, 0.9, 0.5}),
            Map.entry("농구", new double[]{0.9, 0.8, 0.5}),
            Map.entry("배드민턴", new double[]{0.7, 0.6, 0.4}),
            Map.entry("테니스", new double[]{0.8, 0.6, 0.5}),
            Map.entry("클라이밍", new double[]{0.8, 0.4, 0.6}),
            Map.entry("스키/보드", new double[]{0.9, 0.5, 0.4}),
            Map.entry("수영", new double[]{0.8, 0.2, 0.4}),
            Map.entry("헬스/크로스핏", new double[]{0.8, 0.4, 0.4}),
            Map.entry("요가/필라테스", new double[]{0.5, 0.3, 0.6}),
            Map.entry("자전거/라이딩", new double[]{0.7, 0.4, 0.4}),

            // 4. 문화/예술(감상)
            Map.entry("전시/미술관", new double[]{0.3, 0.3, 0.7}),
            Map.entry("팝업스토어", new double[]{0.4, 0.4, 0.3}),
            Map.entry("뮤지컬", new double[]{0.2, 0.5, 0.6}),
            Map.entry("연극", new double[]{0.2, 0.5, 0.7}),
            Map.entry("영화", new double[]{0.1, 0.4, 0.5}),
            Map.entry("콘서트/페스티벌", new double[]{0.6, 0.8, 0.4}),
            Map.entry("스탠드업 코미디", new double[]{0.2, 0.6, 0.5}),
            Map.entry("스포츠 관람", new double[]{0.3, 0.7, 0.4}),

            // 5. 스터디/자기계발
            Map.entry("외국어", new double[]{0.2, 0.5, 0.9}),
            Map.entry("자격증", new double[]{0.1, 0.2, 0.9}),
            Map.entry("코딩/개발", new double[]{0.1, 0.3, 1.0}),
            Map.entry("커리어(취준/이직)", new double[]{0.2, 0.4, 0.9}),
            Map.entry("자기계발(습관/목표)", new double[]{0.2, 0.3, 0.8}),
            Map.entry("독서/책", new double[]{0.1, 0.2, 1.0}),
            Map.entry("재테크/투자", new double[]{0.1, 0.3, 0.9}),
            Map.entry("글쓰기/블로그", new double[]{0.1, 0.3, 0.8}),

            // 6. 여행/나들이
            Map.entry("산책/걷기", new double[]{0.4, 0.3, 0.3}),
            Map.entry("맛집 탐방", new double[]{0.4, 0.6, 0.3}),
            Map.entry("카페 투어", new double[]{0.3, 0.5, 0.3}),
            Map.entry("드라이브", new double[]{0.3, 0.4, 0.2}),
            Map.entry("쇼핑", new double[]{0.4, 0.5, 0.2}),
            Map.entry("근교 여행", new double[]{0.5, 0.6, 0.4}),
            Map.entry("국내 여행", new double[]{0.6, 0.6, 0.5}),
            Map.entry("해외 여행", new double[]{0.7, 0.6, 0.6}),
            Map.entry("캠핑/차박", new double[]{0.6, 0.5, 0.5}),

            // 7. 컨텐츠/미디어
            Map.entry("드라마/영화 토론", new double[]{0.1, 0.7, 0.7}),
            Map.entry("애니메이션", new double[]{0.1, 0.3, 0.5}),
            Map.entry("웹툰/만화", new double[]{0.1, 0.2, 0.4}),
            Map.entry("PC/콘솔 게임", new double[]{0.3, 0.6, 0.7})
    );
}