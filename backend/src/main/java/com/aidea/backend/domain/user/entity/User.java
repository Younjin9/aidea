package com.aidea.backend.domain.user.entity;

import com.aidea.backend.domain.user.enums.Provider;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Builder
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = { "password" })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(length = 200)
    private String bio;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(length = 50)
    private String gender;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @Column(length = 100)
    private String location;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Provider provider = Provider.LOCAL;

    @Column(length = 100)
    private String providerId;

    @Column(name = "location_updated_at")
    private LocalDateTime locationUpdatedAt;

    @Column(name = "chat_enabled")
    @Builder.Default
    private Boolean chatEnabled = true;

    @Column(name = "event_enabled")
    @Builder.Default
    private Boolean eventEnabled = true;

    @Column(name = "marketing_enabled")
    @Builder.Default
    private Boolean marketingEnabled = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public User update(String nickname, String bio, String profileImage, String phoneNumber,
            String gender, String location, Double latitude, Double longitude) {
        this.nickname = nickname;
        this.bio = bio;
        this.profileImage = profileImage;
        this.phoneNumber = phoneNumber;
        this.gender = gender;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        return this;
    }

}
