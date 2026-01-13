package com.aidea.backend.domain.meeting.entity;

import com.aidea.backend.domain.meeting.entity.enums.MeetingStatus;
import com.aidea.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 모임 엔티티
 * - 위치 기반 모임 정보를 관리합니다
 * - JPA가 자동으로 meeting 테이블을 생성합니다
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "meeting")
public class Meeting {

    // ========== 기본 키 ==========
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========== 모임 기본 정보 ==========
    @Column(nullable = false, length = 100)
    private String title; // 모임 제목

    @Column(columnDefinition = "TEXT")
    private String description; // 모임 설명

    private String imageUrl; // 모임 대표 이미지

    // ========== 위치 정보 ==========
    @Column(nullable = false, length = 200)
    private String location; // 주소 (예: "서울 강남구 강남대로 396")

    @Column(nullable = false)
    private Double latitude; // 위도

    @Column(nullable = false)
    private Double longitude; // 경도

    private String locationDetail; // 상세 위치 (예: "강남역 2번 출구")

    // ========== 모임 설정 ==========
    @Column(nullable = false)
    private Integer maxMembers; // 최대 인원

    @Column(nullable = false)
    private Integer currentMembers = 1; // 현재 인원 (생성자 포함)

    @Column(nullable = false)
    private LocalDateTime meetingDate; // 모임 날짜

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MeetingStatus status = MeetingStatus.RECRUITING; // 모임 상태

    @Column(nullable = false)
    private Boolean isApprovalRequired = false; // 승인 필요 여부

    // ========== 연관 관계 ==========
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator; // 모임 생성자

    // ========== 시간 정보 (자동 관리) ==========
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // 생성 시간

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt; // 수정 시간

    // ========== 생성자 ==========
    @Builder
    public Meeting(
            String title,
            String description,
            String imageUrl,
            String location,
            Double latitude,
            Double longitude,
            String locationDetail,
            Integer maxMembers,
            LocalDateTime meetingDate,
            Boolean isApprovalRequired,
            User creator) {
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.locationDetail = locationDetail;
        this.maxMembers = maxMembers;
        this.currentMembers = 1; // 생성자 포함 1명으로 시작
        this.meetingDate = meetingDate;
        this.isApprovalRequired = isApprovalRequired != null ? isApprovalRequired : false;
        this.status = MeetingStatus.RECRUITING;
        this.creator = creator;
    }

    // ========== 비즈니스 메서드 ==========

    /**
     * 참가자 수 증가
     * - 모임 참여 시 호출
     */
    public void incrementMembers() {
        this.currentMembers++;
    }

    /**
     * 참가자 수 감소
     * - 모임 탈퇴 시 호출
     * - 최소 1명(생성자)은 유지
     */
    public void decrementMembers() {
        if (this.currentMembers > 1) {
            this.currentMembers--;
        }
    }

    /**
     * 모임이 가득 찼는지 확인
     */
    public boolean isFull() {
        return this.currentMembers >= this.maxMembers;
    }

    /**
     * 모임 상태 변경
     */
    public void updateStatus(MeetingStatus newStatus) {
        this.status = newStatus;
    }

    // ========== DTO 변환 메서드 ==========

    /**
     * MeetingResponse로 변환
     */
    public com.aidea.backend.domain.meeting.dto.response.MeetingResponse toResponse() {
        return com.aidea.backend.domain.meeting.dto.response.MeetingResponse.builder()
                .meetingId(this.id)
                .title(this.title)
                .description(this.description)
                .imageUrl(this.imageUrl)
                .location(this.location)
                .latitude(this.latitude)
                .longitude(this.longitude)
                .locationDetail(this.locationDetail)
                .maxMembers(this.maxMembers)
                .currentMembers(this.currentMembers)
                .meetingDate(this.meetingDate)
                .status(this.status)
                .isApprovalRequired(this.isApprovalRequired)
                .creator(com.aidea.backend.domain.meeting.dto.response.CreatorDto.builder()
                        .userId(this.creator.getUserId())
                        .nickname(this.creator.getNickname())
                        .profileImage(this.creator.getProfileImage())
                        .build())
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }

    /**
     * MeetingSummaryResponse로 변환
     */
    public com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse toSummary() {
        return com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse.builder()
                .meetingId(this.id)
                .title(this.title)
                .imageUrl(this.imageUrl)
                .location(this.location)
                .meetingDate(this.meetingDate)
                .currentMembers(this.currentMembers)
                .maxMembers(this.maxMembers)
                .status(this.status)
                .build();
    }
}
