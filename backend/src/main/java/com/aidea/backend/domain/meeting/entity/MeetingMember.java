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

  // ========== 시간 정보 ==========
  @CreatedDate
  @Column(nullable = false, updatable = false)
  private LocalDateTime joinedAt; // 참여 시간

  // ========== 생성자 ==========
  @Builder
  public MeetingMember(Meeting meeting, User user, MemberRole role, MemberStatus status) {
    this.meeting = meeting;
    this.user = user;
    this.role = role != null ? role : MemberRole.MEMBER;
    this.status = status != null ? status : MemberStatus.APPROVED;
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
}
