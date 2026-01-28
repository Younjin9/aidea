package com.aidea.backend.domain.meeting.entity.enums;

import lombok.Getter;

/**
 * 지역 정보 (서울시 구 단위)
 */
@Getter
public enum Region {
    // 서울시 25개 구 (가나다순)
    SEOUL_GANGNAM("서울시", "강남구"),
    SEOUL_GANGDONG("서울시", "강동구"),
    SEOUL_GANGBUK("서울시", "강북구"),
    SEOUL_GANGSEO("서울시", "강서구"),
    SEOUL_GWANAK("서울시", "관악구"),
    SEOUL_GWANGJIN("서울시", "광진구"),
    SEOUL_GURO("서울시", "구로구"),
    SEOUL_GEUMCHEON("서울시", "금천구"),
    SEOUL_NOWON("서울시", "노원구"),
    SEOUL_DOBONG("서울시", "도봉구"),
    SEOUL_DONGDAEMUN("서울시", "동대문구"),
    SEOUL_DONGJAK("서울시", "동작구"),
    SEOUL_MAPO("서울시", "마포구"),
    SEOUL_SEODAEMUN("서울시", "서대문구"),
    SEOUL_SEOCHO("서울시", "서초구"),
    SEOUL_SEONGDONG("서울시", "성동구"),
    SEOUL_SEONGBUK("서울시", "성북구"),
    SEOUL_SONGPA("서울시", "송파구"),
    SEOUL_YANGCHEON("서울시", "양천구"),
    SEOUL_YEONGDEUNGPO("서울시", "영등포구"),
    SEOUL_YONGSAN("서울시", "용산구"),
    SEOUL_EUNPYEONG("서울시", "은평구"),
    SEOUL_JONGNO("서울시", "종로구"),
    SEOUL_JUNG("서울시", "중구"),
    SEOUL_JUNGNANG("서울시", "중랑구");

    private final String city;
    private final String district;

    Region(String city, String district) {
        this.city = city;
        this.district = district;
    }

    /**
     * 전체 지역명 반환 (예: "서울시 관악구")
     */
    public String getFullName() {
        return city + " " + district;
    }

    public static Region findByFullName(String fullName) {
        for (Region region : values()) {
            if (region.getFullName().equals(fullName) || fullName.contains(region.district)) {
                return region;
            }
        }
        // Default or exception?
        // Fallback: try to match just district
        return SEOUL_GANGNAM; // Temporary Default or throw
    }
}
