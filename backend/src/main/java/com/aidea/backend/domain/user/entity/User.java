package com.aidea.backend.domain.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 사용자 엔티티
 * - 모임 생성자 정보를 관리합니다
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "user")
public class User {

    // ========== 기본 키 ==========
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========== 사용자 기본 정보 ==========
    @Column(unique = true, nullable = false, length = 100)
    private String email; // 이메일

    @Column(nullable = false, length = 50)
    private String nickname; // 닉네임

    private String profileImage; // 프로필 이미지 URL

    // ========== 위치 정보 ==========
    private Double latitude; // 위도
    private Double longitude; // 경도

    // ========== 시간 정보 (자동 관리) ==========
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // 생성 시간

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt; // 수정 시간

    // ========== 생성자 ==========
    @Builder
    public User(String email, String nickname, String profileImage) {
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
    }
}
