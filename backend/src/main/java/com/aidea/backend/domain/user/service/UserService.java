package com.aidea.backend.domain.user.service;

import com.aidea.backend.domain.user.dto.*;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.repository.UserRepository;
import com.aidea.backend.domain.user.repository.UserInterestRepository;
import com.aidea.backend.domain.meeting.repository.MeetingMemberRepository;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.meeting.entity.MeetingMember;
import com.aidea.backend.domain.meeting.entity.enums.MemberStatus;
import com.aidea.backend.domain.meeting.dto.response.MeetingResponse;
import com.aidea.backend.domain.meeting.dto.response.CreatorDto;
import com.aidea.backend.domain.user.entity.UserInterest;
import com.aidea.backend.domain.interest.repository.InterestRepository;
import org.springframework.web.multipart.MultipartFile;
import com.aidea.backend.global.secret.jwt.JwtTokenProvider;
import com.aidea.backend.global.secret.jwt.RefreshToken;
import com.aidea.backend.global.secret.jwt.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider jwtTokenProvider;
        private final RefreshTokenRepository refreshTokenRepository;
        private final MeetingMemberRepository meetingMemberRepository;
        private final MeetingRepository meetingRepository;
        private final UserInterestRepository userInterestRepository;
        private final InterestRepository interestRepository;

        @Transactional
        public UserResponse joinUser(UserJoinDto dto) {
                log.info("회원가입 시도: email={}", dto.getEmail());

                if (userRepository.existsByEmail(dto.getEmail())) {
                        throw new RuntimeException("이미 존재하는 이메일입니다.");
                }

                User user = User.builder()
                                .email(dto.getEmail())
                                .password(passwordEncoder.encode(dto.getPassword()))
                                .nickname(dto.getNickname())
                                .bio(dto.getBio())
                                .phoneNumber(dto.getPhoneNumber())
                                .birthDate(dto.getBirthDate())
                                .gender(dto.getGender())
                                .profileImage(dto.getProfileImage())
                                .location(dto.getLocation())
                                .latitude(dto.getLatitude())
                                .longitude(dto.getLongitude())
                                .build();

                User savedUser = userRepository.save(user);
                log.info("회원가입 완료: userId={}", savedUser.getUserId());

                return convertToUserResponse(savedUser);
        }

        @Transactional(readOnly = true)
        public LoginResponse loginUser(UserLoginDto dto) {
                log.info("로그인 시도: email={}", dto.getEmail());

                User user = userRepository.findByEmail(dto.getEmail())
                                .orElseThrow(() -> new RuntimeException("이메일이 일치하지 않습니다."));

                if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
                        throw new RuntimeException("비밀번호가 일치하지 않습니다.");
                }

                String accessToken = jwtTokenProvider.createAccessToken(user.getEmail());
                String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

                refreshTokenRepository.deleteByEmail(user.getEmail());
                RefreshToken refreshTokenEntity = RefreshToken.builder()
                                .token(refreshToken)
                                .email(user.getEmail())
                                .userId(user.getUserId())
                                .build();
                refreshTokenRepository.save(refreshTokenEntity);

                UserResponse userResponse = convertToUserResponse(user);
                log.info("로그인 성공: email={}", dto.getEmail());
                return new LoginResponse(accessToken, refreshToken, userResponse);
        }

        @Transactional
        public TokenRefreshResponse refreshToken(String refreshToken) {
                log.info("토큰 재발급 시도");

                if (!jwtTokenProvider.validateToken(refreshToken)) {
                        throw new IllegalArgumentException("유효하지 않은 Refresh Token입니다.");
                }

                RefreshToken storedToken = refreshTokenRepository.findById(refreshToken)
                                .orElseThrow(() -> new IllegalArgumentException("저장된 Refresh Token이 없습니다."));

                String email = storedToken.getEmail();

                refreshTokenRepository.deleteByEmail(email);

                String newAccessToken = jwtTokenProvider.createAccessToken(email);
                String newRefreshToken = jwtTokenProvider.createRefreshToken(email);

                RefreshToken newRefreshTokenEntity = RefreshToken.builder()
                                .token(newRefreshToken)
                                .email(email)
                                .userId(storedToken.getUserId())
                                .build();
                refreshTokenRepository.save(newRefreshTokenEntity);

                log.info("토큰 재발급 완료: email={}", email);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                UserResponse userResponse = convertToUserResponse(user);

                return new TokenRefreshResponse(newAccessToken, newRefreshToken, 1800, userResponse);
        }

        @Transactional(readOnly = true)
        public NicknameCheckResponse checkNickname(String nickname) {
                log.info("닉네임 중복 확인: nickname={}", nickname);

                boolean isDuplicate = userRepository.existsByNickname(nickname);

                if (isDuplicate) {
                        log.info("중복된 닉네임: nickname={}", nickname);
                        return new NicknameCheckResponse(false, "이미 사용 중인 닉네임입니다.");
                }

                log.info("사용 가능한 닉네임: nickname={}", nickname);
                return new NicknameCheckResponse(true, "사용 가능한 닉네임입니다.");
        }

        @Transactional
        public void logout(String email) {
                log.info("로그아웃 시도: email={}", email);

                refreshTokenRepository.deleteByEmail(email);

                log.info("로그아웃 완료: email={}", email);
        }

        @Transactional(readOnly = true)
        public UserResponse getMyProfile(String email) {
                log.info("내 프로필 조회: email={}", email);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                return convertToUserResponse(user);
        }

        @Transactional
        public UserResponse updateMyProfile(String email, UserUpdateDto dto) {
                log.info("내 프로필 수정: email={}", email);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                user.update(
                                dto.getNickname() != null ? dto.getNickname() : user.getNickname(),
                                dto.getBio() != null ? dto.getBio() : user.getBio(),
                                dto.getProfileImage() != null ? dto.getProfileImage() : user.getProfileImage(),
                                dto.getPhoneNumber() != null ? dto.getPhoneNumber() : user.getPhoneNumber(),
                                dto.getGender() != null ? dto.getGender() : user.getGender(),
                                dto.getLocation() != null ? dto.getLocation() : user.getLocation(),
                                dto.getLatitude() != null ? dto.getLatitude() : user.getLatitude(),
                                dto.getLongitude() != null ? dto.getLongitude() : user.getLongitude());

                log.info("user={}", user);

                User updatedUser = userRepository.save(user);

                return convertToUserResponse(updatedUser);
        }

        @Transactional
        public UpdateProfileImageResponse updateProfileImage(String email, MultipartFile image) {
                log.info("프로필 이미지 수정: email={}", email);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                // TODO: 실제 파일 업로드 로직 필요 (S3 등)
                // 임시로 파일 이름으로 설정
                String imageUrl = "https://example.com/images/" + image.getOriginalFilename();

                user.setProfileImage(imageUrl);
                userRepository.save(user);

                return new UpdateProfileImageResponse(imageUrl);
        }

        @Transactional
        public LocationUpdateResponse updateMyLocation(String email, LocationUpdateDto dto) {
                log.info("위치 정보 수정: email={}", email);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                user.setLatitude(dto.getLatitude());
                user.setLongitude(dto.getLongitude());
                user.setLocation(dto.getRegion());
                user.setLocationUpdatedAt(java.time.LocalDateTime.now());

                userRepository.save(user);

                UserResponse.Location location = new UserResponse.Location(
                                dto.getLatitude(),
                                dto.getLongitude(),
                                dto.getRegion());

                return new LocationUpdateResponse(true, location);
        }

        @Transactional(readOnly = true)
        public List<MeetingResponse> getMyMeetings(String email, String status) {
                log.info("내 모임 목록 조회: email={}, status={}", email, status);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                List<MeetingMember> meetingMembers;
                if ("active".equals(status)) {
                        meetingMembers = meetingMemberRepository.findByUser_UserIdAndStatusNot(
                                        user.getUserId(), MemberStatus.LEFT);
                } else {
                        meetingMembers = meetingMemberRepository.findByUser_UserId(user.getUserId());
                }

                return meetingMembers.stream()
                                .map(meetingMember -> {
                                        var meeting = meetingMember.getMeeting();
                                        return MeetingResponse.builder()
                                                        .meetingId(meeting.getId())
                                                        .title(meeting.getTitle())
                                                        .description(meeting.getDescription())
                                                        .imageUrl(meeting.getImageUrl())
                                                        .category(meeting.getCategory())
                                                        .categoryDisplayName(meeting.getCategory().getDisplayName())
                                                        .region(meeting.getRegion())
                                                        .regionFullName(meeting.getRegion().getFullName())
                                                        .location(meeting.getLocation())
                                                        .latitude(meeting.getLatitude())
                                                        .longitude(meeting.getLongitude())
                                                        .locationDetail(meeting.getLocationDetail())
                                                        .maxMembers(meeting.getMaxMembers())
                                                        .currentMembers(meeting.getCurrentMembers())
                                                        .meetingDate(meeting.getMeetingDate())
                                                        .status(meeting.getStatus())
                                                        .isApprovalRequired(meeting.getIsApprovalRequired())
                                                        .creator(CreatorDto.builder()
                                                                        .userId(meeting.getCreator().getUserId())
                                                                        .nickname(meeting.getCreator().getNickname())
                                                                        .profileImage(meeting.getCreator()
                                                                                        .getProfileImage())
                                                                        .build())
                                                        .createdAt(meeting.getCreatedAt())
                                                        .updatedAt(meeting.getUpdatedAt())
                                                        .build();
                                })
                                .collect(java.util.stream.Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<MeetingResponse> getMyHostingMeetings(String email) {
                log.info("내가 개설한 모임 목록 조회: email={}", email);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                return meetingRepository.findByCreator_UserId(user.getUserId()).stream()
                                .map(meeting -> MeetingResponse.builder()
                                                .meetingId(meeting.getId())
                                                .title(meeting.getTitle())
                                                .description(meeting.getDescription())
                                                .imageUrl(meeting.getImageUrl())
                                                .category(meeting.getCategory())
                                                .categoryDisplayName(meeting.getCategory().getDisplayName())
                                                .region(meeting.getRegion())
                                                .regionFullName(meeting.getRegion().getFullName())
                                                .location(meeting.getLocation())
                                                .latitude(meeting.getLatitude())
                                                .longitude(meeting.getLongitude())
                                                .locationDetail(meeting.getLocationDetail())
                                                .maxMembers(meeting.getMaxMembers())
                                                .currentMembers(meeting.getCurrentMembers())
                                                .meetingDate(meeting.getMeetingDate())
                                                .status(meeting.getStatus())
                                                .isApprovalRequired(meeting.getIsApprovalRequired())
                                                .creator(CreatorDto.builder()
                                                                .userId(meeting.getCreator().getUserId())
                                                                .nickname(meeting.getCreator().getNickname())
                                                                .profileImage(meeting.getCreator().getProfileImage())
                                                                .build())
                                                .createdAt(meeting.getCreatedAt())
                                                .updatedAt(meeting.getUpdatedAt())
                                                .build())
                                .collect(java.util.stream.Collectors.toList());
        }

        @Transactional(readOnly = true)
        public UserStatsResponse getMyStats(String email) {
                log.info("내 통계 정보 조회: email={}", email);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                // 참가한 모임 수
                List<MeetingMember> allMeetings = meetingMemberRepository.findByUser_UserIdAndStatusNot(
                                user.getUserId(), MemberStatus.LEFT);
                int groupCount = allMeetings.size();

                // 개설한 이벤트 수
                int eventCount = meetingRepository.findByCreator_UserId(user.getUserId()).size();

                // 출석률 (임시 계산 - 실제로는 출석 기록이 필요)
                double attendanceRate = 85.0; // TODO: 실제 출석 기록으로 계산 필요

                // 활동 점수 (임시 계산)
                int activityScore = groupCount * 10 + (int) attendanceRate;

                // 리뷰 수 (TODO: Review 엔티티와 연동 필요)
                int reviewCount = 0;

                return UserStatsResponse.builder()
                                .groupCount(groupCount)
                                .eventCount(eventCount)
                                .attendanceRate(attendanceRate)
                                .activityScore(activityScore)
                                .reviewCount(reviewCount)
                                .build();
        }

        @Transactional(readOnly = true)
        public NotificationSettingsResponse getNotificationSettings(String email) {
                log.info("알림 설정 조회: email={}", email);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                return NotificationSettingsResponse.builder()
                                .chatEnabled(user.getChatEnabled())
                                .eventEnabled(user.getEventEnabled())
                                .marketingEnabled(user.getMarketingEnabled())
                                .build();
        }

        @Transactional
        public NotificationSettingsResponse updateNotificationSettings(String email,
                        NotificationSettingsRequest request) {
                log.info("알림 설정 수정: email={}", email);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                user.setChatEnabled(
                                request.getChatEnabled() != null ? request.getChatEnabled() : user.getChatEnabled());
                user.setEventEnabled(
                                request.getEventEnabled() != null ? request.getEventEnabled() : user.getEventEnabled());
                user.setMarketingEnabled(request.getMarketingEnabled() != null ? request.getMarketingEnabled()
                                : user.getMarketingEnabled());

                userRepository.save(user);

                return NotificationSettingsResponse.builder()
                                .chatEnabled(user.getChatEnabled())
                                .eventEnabled(user.getEventEnabled())
                                .marketingEnabled(user.getMarketingEnabled())
                                .build();
        }

        @Transactional
        public void deleteAccount(String email, String reason) {
                log.info("회원 탈퇴: email={}, reason={}", email, reason);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                // TODO: 관련 데이터 처리 (모임 탈퇴, 채팅방 등)

                userRepository.delete(user);

                log.info("회원 탈퇴 완료: email={}", email);
        }

        @Transactional
        public void updateUserInterests(String email, List<String> interests) {
                log.info("사용자 관심사 업데이트: email={}, interests={}", email, interests);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                // 기존 관심사 삭제
                userInterestRepository.deleteByUser_UserId(user.getUserId());
                userInterestRepository.flush();

                // 새로운 관심사 추가
                if (interests != null && !interests.isEmpty()) {
                        List<UserInterest> userInterests = interests.stream()
                                        .map(interestName -> {
                                                var interest = interestRepository.findByInterestName(interestName)
                                                                .orElse(null);
                                                if (interest != null) {
                                                        return UserInterest.builder()
                                                                        .user(user)
                                                                        .interest(interest)
                                                                        .build();
                                                }
                                                return null;
                                        })
                                        .filter(java.util.Objects::nonNull)
                                        .toList();

                        userInterestRepository.saveAll(userInterests);
                }

                log.info("사용자 관심사 업데이트 완료: email={}", email);
        }

        private UserResponse convertToUserResponse(User user) {
                return new UserResponse(
                                String.valueOf(user.getUserId()),
                                user.getEmail(),
                                user.getNickname(),
                                user.getBio(),
                                user.getPhoneNumber(),
                                user.getBirthDate(),
                                user.getGender(),
                                user.getProfileImage(),
                                new UserResponse.Location(
                                                user.getLatitude(),
                                                user.getLongitude(),
                                                user.getLocation()),
                                user.getProvider().name(),
                                getUserInterests(user),
                                user.getCreatedAt(),
                                user.getUpdatedAt());
        }

        private List<String> getUserInterests(User user) {
                return userInterestRepository.findAllByUser(user).stream()
                                .map(ui -> ui.getInterest().getInterestName())
                                .toList();
        }
}
