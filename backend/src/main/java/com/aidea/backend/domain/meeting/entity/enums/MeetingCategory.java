package com.aidea.backend.domain.meeting.entity.enums;

import lombok.Getter;

/**
 * 모임 카테고리 (대분류)
 */
@Getter
public enum MeetingCategory {
    HOBBY_LEISURE("hobby", "취미/여가", "다양한 취미와 여가 활동"),
    ACTIVITY("activity", "액티비티", "야외 활동 및 체험"),
    SPORTS("sports", "운동/스포츠", "운동 및 스포츠 활동"),
    CULTURE_ART("culture", "문화/예술", "문화 및 예술 활동"),
    STUDY_SELF_DEV("self_improvement", "스터디/자기계발", "학습 및 자기계발"),
    TRAVEL("travel", "여행/나들이", "여행 및 나들이"),
    CONTENT_MEDIA("contents", "콘텐츠/미디어", "영화, 드라마, 유튜브 등");

    private final String code;
    private final String displayName;
    private final String description;

    MeetingCategory(String code, String displayName, String description) {
        this.code = code;
        this.displayName = displayName;
        this.description = description;
    }

    public static MeetingCategory findByCode(String code) {
        for (MeetingCategory category : values()) {
            if (category.code.equalsIgnoreCase(code)) {
                return category;
            }
        }
        // Fallback for direct enum name usage or error
        try {
            return MeetingCategory.valueOf(code.toUpperCase());
        } catch (IllegalArgumentException e) {
             throw new IllegalArgumentException("존재하지 않는 카테고리입니다: " + code);
        }
    }
    
    public String getDisplayName() {
        return this.displayName;
    }
}
