package com.aidea.backend.domain.user.entity;

import com.aidea.backend.domain.user.enums.Provider;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 사용자 엔티티
 * - 모임 생성자 및 회원 정보를 관리합니다
 */
@Entity
@Table(name = "user")  // ← DB 테이블명과 일치
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@EntityListeners(AuditingEntityListener.class)
@ToString(exclude = {"password"})
public class User {
    
    // ========== 기본 키 ==========
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // ← DB 컬럼명과 일치
    
    // ========== 계정 정보 ==========
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(length = 100)
    private String password;
    
    @Column(nullable = false, length = 50)
    private String nickname;
    
    @Column(length = 20)
    private String phoneNumber;
    
    private LocalDate birthDate;
    
    @Column(length = 10)
    private String gender;
    
    @Column(length = 500)
    private String profileImage;
    
    // ========== 위치 정보 ==========
    @Column(length = 100)
    private String location;
    
    private Double latitude;
    
    private Double longitude;
    
    private LocalDateTime locationUpdatedAt;
    
    // ========== 소셜 로그인 정보 ==========
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Provider provider = Provider.LOCAL;
    
    @Column(length = 100)
    private String providerId;
    
    // ========== 시간 정보 (자동 관리) ==========
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // ========== 비즈니스 메서드 ==========
    public User update(String nickname, String profileImage) {
        this.nickname = nickname;
        this.profileImage = profileImage;
        return this;
    }
    
    public void updateLocation(String location, Double latitude, Double longitude) {
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.locationUpdatedAt = LocalDateTime.now();
    }
}