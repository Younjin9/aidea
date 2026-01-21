package com.aidea.backend.domain.user.entity;

import com.aidea.backend.domain.interest.entity.Interest;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_interest", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_interest", columnNames = { "user_id", "interest_id" })
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@ToString(exclude = { "user", "interest" })
public class UserInterest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "user_interest_id")
  private Long userInterestId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "interest_id", nullable = false)
  private Interest interest;

  @CreatedDate
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Builder
  public UserInterest(User user, Interest interest) {
    this.user = user;
    this.interest = interest;
  }
}
