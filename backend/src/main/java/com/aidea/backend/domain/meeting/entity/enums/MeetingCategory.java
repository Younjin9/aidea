package com.aidea.backend.domain.meeting.entity.enums;

import lombok.Getter;

/**
 * 모임 카테고리 (대분류)
 */
@Getter
public enum MeetingCategory {
    HOBBY_LEISURE("취미/여가", "다양한 취미와 여가 활동"),
    ACTIVITY("액티비티", "야외 활동 및 체험"),
    SPORTS("운동/스포츠", "운동 및 스포츠 활동"),
    CULTURE_ART("문화/예술", "문화 및 예술 활동"),
    STUDY_SELF_DEV("스터디/자기계발", "학습 및 자기계발"),
    TRAVEL("여행/나들이", "여행 및 나들이"),
    CONTENT_MEDIA("콘텐츠/미디어", "영화, 드라마, 유튜브 등");

    private final String displayName;
    private final String description;

    MeetingCategory(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
}
