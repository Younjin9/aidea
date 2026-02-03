package com.aidea.backend.domain.interest.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "interest")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@ToString
public class Interest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "interest_id")
  private Long interestId;

  @Column(name = "interest_name", length = 50, nullable = false, unique = true)
  private String interestName;

  @Column(length = 50)
  private String category;

  @CreatedDate
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @LastModifiedDate
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @Builder
  public Interest(String interestName, String category) {
    this.interestName = interestName;
    this.category = category;
  }
}
