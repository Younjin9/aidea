package com.aidea.backend.domain.user.enums;

import lombok.Getter;

@Getter
public enum Provider {
    LOCAL("로컬", "직접가입"),
    KAKAO("카카오", "카카오 로그인"),
    GOOGLE("구글", "구글 로그인"),
    NAVER("네이버", "네이버 로그인");

    private String name;
    private String description;

    Provider(String name, String description) {
        this.name = name;
        this.description = description;
    }
}
