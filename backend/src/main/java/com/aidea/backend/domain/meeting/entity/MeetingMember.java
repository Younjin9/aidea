package com.aidea.backend.domain.meeting.entity;

import com.aidea.backend.domain.meeting.entity.enums.MemberRole;
import com.aidea.backend.domain.meeting.entity.enums.MemberStatus;
import com.aidea.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 모임 멤버 엔티티
 * - 모임 참가자 정보를 관리합니다
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "meeting_member", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "meeting_id", "user_id" })
})
public class MeetingMember {

  // ========== 기본 키 ==========
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // ========== 연관 관계 ==========
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "meeting_id", nullable = false)
  private Meeting meeting; // 모임

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user; // 사용자

  // ========== 멤버 정보 ==========
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private MemberRole role = MemberRole.MEMBER; // 역할 (HOST/MEMBER)

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private MemberStatus status = MemberStatus.APPROVED; // 상태

  @Column(length = 500)
  private String requestMessage; // 가입 인사

  // ========== 시간 정보 ==========
  @CreatedDate
  @Column(nullable = false, updatable = false)
  private LocalDateTime joinedAt; // 참여 시간

  // ========== 생성자 ==========
  @Builder
  public MeetingMember(Meeting meeting, User user, MemberRole role, MemberStatus status, String requestMessage) {
    this.meeting = meeting;
    this.user = user;
    this.role = role != null ? role : MemberRole.MEMBER;
    this.status = status != null ? status : MemberStatus.APPROVED;
    this.requestMessage = requestMessage;
  }

  /**
   * HOST로 생성 (모임 생성자용)
   */
  public static MeetingMember createHost(Meeting meeting, User user) {
    return MeetingMember.builder()
        .meeting(meeting)
        .user(user)
        .role(MemberRole.HOST)
        .status(MemberStatus.APPROVED)
        .build();
  }

  /**
   * 일반 멤버로 생성 (참가 신청용)
   */
  public static MeetingMember createMember(Meeting meeting, User user, boolean isApprovalRequired,
      String requestMessage) {
    return MeetingMember.builder()
        .meeting(meeting)
        .user(user)
        .role(MemberRole.MEMBER)
        .status(isApprovalRequired ? MemberStatus.PENDING : MemberStatus.APPROVED)
        .requestMessage(requestMessage)
        .build();
  }

  // ========== 상태 변경 메서드 ==========

  /**
   * 참가 신청 승인
   */
  public void approve() {
    this.status = MemberStatus.APPROVED;
  }

  /**
   * 참가 신청 거절
   */
  public void reject() {
    this.status = MemberStatus.REJECTED;
  }

  /**
   * 모임 탈퇴
   */
  public void leave() {
    this.status = MemberStatus.LEFT;
  }

  /**
   * 재가입 처리 (LEFT 상태에서 재활성화)
   * 
   * @param requestMessage 재가입 시 새로운 요청 메시지 (null 허용)
   * @param autoApprove    자동 승인 여부
   */
  public void reactivate(String requestMessage, boolean autoApprove) {
    this.status = autoApprove ? MemberStatus.APPROVED : MemberStatus.PENDING;
    this.requestMessage = requestMessage != null ? requestMessage : "";
    this.joinedAt = LocalDateTime.now();
  }

  public void setRequestMessage(String requestMessage) {
    this.requestMessage = requestMessage;
  }

  /**
   * 멤버로 역할 변경 (호스트 -> 멤버)
   */
  public void assignMember() {
    this.role = MemberRole.MEMBER;
  }

  /**
   * 호스트로 역할 변경 (멤버 -> 호스트)
   */
  public void assignHost() {
    this.role = MemberRole.HOST;
  }

  // ========== DTO 변환 메서드 ==========

  /**
   * MemberResponse로 변환
   */
  public com.aidea.backend.domain.meeting.dto.response.MemberResponse toMemberResponse() {
    return com.aidea.backend.domain.meeting.dto.response.MemberResponse.builder()
        .memberId(this.id)
        .userId(this.user.getUserId())
        .nickname(this.user.getNickname())
        .profileImage(this.user.getProfileImage())
        .role(this.role)
        .status(this.status)
        .joinedAt(this.joinedAt)
        .build();
  }

  /**
   * JoinRequestResponse로 변환
   */
  public com.aidea.backend.domain.meeting.dto.response.JoinRequestResponse toJoinRequestResponse() {
    return com.aidea.backend.domain.meeting.dto.response.JoinRequestResponse.builder()
        .memberId(this.id)
        .userId(this.user.getUserId())
        .nickname(this.user.getNickname())
        .profileImage(this.user.getProfileImage())
        .requestMessage(this.requestMessage)
        .status(this.status)
        .requestedAt(this.joinedAt)
        .build();
  }
}
