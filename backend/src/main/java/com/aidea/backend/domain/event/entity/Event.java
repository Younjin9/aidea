package com.aidea.backend.domain.event.entity;

import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.user.entity.User;
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
 * 정모(일정) 엔티티
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "event")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    // 생성자 (작성자)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false)
    private LocalDateTime date; // scheduledAt

    @Column(nullable = false)
    private String locationName; // placeName

    // 좌표 정보
    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private Integer maxParticipants;

    private Integer currentParticipants = 0;

    private String cost; // 회비/비용 설명

    @Column(columnDefinition = "TEXT")
    private String description; // notes

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<EventParticipant> participants = new java.util.ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Event(Meeting meeting, User creator, String title, LocalDateTime date,
            String locationName, Double latitude, Double longitude,
            Integer maxParticipants, String cost, String description) {
        this.meeting = meeting;
        this.creator = creator;
        this.title = title;
        this.date = date;
        this.locationName = locationName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.maxParticipants = maxParticipants;
        this.cost = cost;
        this.description = description;
        this.currentParticipants = 0;
    }

    public void update(String title, LocalDateTime date, String locationName,
            Double latitude, Double longitude, Integer maxParticipants,
            String cost, String description) {
        if (title != null)
            this.title = title;
        if (date != null)
            this.date = date;
        if (locationName != null)
            this.locationName = locationName;
        if (latitude != null)
            this.latitude = latitude;
        if (longitude != null)
            this.longitude = longitude;
        if (maxParticipants != null)
            this.maxParticipants = maxParticipants;
        if (cost != null)
            this.cost = cost;
        if (description != null)
            this.description = description;
    }

    public void incrementParticipants() {
        this.currentParticipants++;
    }

    public void decrementParticipants() {
        if (this.currentParticipants > 0) {
            this.currentParticipants--;
        }
    }
}
