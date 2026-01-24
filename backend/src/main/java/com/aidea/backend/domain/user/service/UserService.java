package com.aidea.backend.domain.user.service;

import com.aidea.backend.domain.user.dto.*;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.repository.UserRepository;
import com.aidea.backend.global.secret.jwt.JwtTokenProvider;
import com.aidea.backend.global.secret.jwt.RefreshToken;
import com.aidea.backend.global.secret.jwt.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider jwtTokenProvider;
        private final RefreshTokenRepository refreshTokenRepository;

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

                return new UserResponse(
                                String.valueOf(savedUser.getUserId()),
                                savedUser.getEmail(),
                                savedUser.getNickname(),
                                savedUser.getPhoneNumber(),
                                savedUser.getBirthDate(),
                                savedUser.getGender(),
                                savedUser.getProfileImage(),
                                new UserResponse.Location(
                                                savedUser.getLatitude(),
                                                savedUser.getLongitude(),
                                                savedUser.getLocation()),
                                savedUser.getProvider().name(),
                                java.util.Collections.emptyList(),
                                savedUser.getCreatedAt(),
                                savedUser.getUpdatedAt());
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

                UserResponse userResponse = new UserResponse(
                                String.valueOf(user.getUserId()),
                                user.getEmail(),
                                user.getNickname(),
                                user.getPhoneNumber(),
                                user.getBirthDate(),
                                user.getGender(),
                                user.getProfileImage(),
                                new UserResponse.Location(
                                                user.getLatitude(),
                                                user.getLongitude(),
                                                user.getLocation()),
                                user.getProvider().name(),
                                java.util.Collections.emptyList(),
                                user.getCreatedAt(),
                                user.getUpdatedAt());
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

                UserResponse userResponse = new UserResponse(
                                String.valueOf(user.getUserId()),
                                user.getEmail(),
                                user.getNickname(),
                                user.getPhoneNumber(),
                                user.getBirthDate(),
                                user.getGender(),
                                user.getProfileImage(),
                                new UserResponse.Location(
                                                user.getLatitude(),
                                                user.getLongitude(),
                                                user.getLocation()),
                                user.getProvider().name(),
                                java.util.Collections.emptyList(),
                                user.getCreatedAt(),
                                user.getUpdatedAt());

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

                return new UserResponse(
                                String.valueOf(user.getUserId()),
                                user.getEmail(),
                                user.getNickname(),
                                user.getPhoneNumber(),
                                user.getBirthDate(),
                                user.getGender(),
                                user.getProfileImage(),
                                new UserResponse.Location(
                                                user.getLatitude(),
                                                user.getLongitude(),
                                                user.getLocation()),
                                user.getProvider().name(),
                                java.util.Collections.emptyList(),
                                user.getCreatedAt(),
                                user.getUpdatedAt());
        }

        @Transactional
        public UserResponse updateMyProfile(String email, UserUpdateDto dto) {
                log.info("내 프로필 수정: email={}", email);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                user.update(
                                dto.getNickname() != null ? dto.getNickname() : user.getNickname(),
                                dto.getProfileImage() != null ? dto.getProfileImage() : user.getProfileImage(),
                                dto.getPhoneNumber() != null ? dto.getPhoneNumber() : user.getPhoneNumber(),
                                dto.getGender() != null ? dto.getGender() : user.getGender(),
                                dto.getLocation() != null ? dto.getLocation() : user.getLocation(),
                                dto.getLatitude() != null ? dto.getLatitude() : user.getLatitude(),
                                dto.getLongitude() != null ? dto.getLongitude() : user.getLongitude()
                );

                User updatedUser = userRepository.save(user);

                return new UserResponse(
                                String.valueOf(updatedUser.getUserId()),
                                updatedUser.getEmail(),
                                updatedUser.getNickname(),
                                updatedUser.getPhoneNumber(),
                                updatedUser.getBirthDate(),
                                updatedUser.getGender(),
                                updatedUser.getProfileImage(),
                                new UserResponse.Location(
                                                updatedUser.getLatitude(),
                                                updatedUser.getLongitude(),
                                                updatedUser.getLocation()),
                                updatedUser.getProvider().name(),
                                java.util.Collections.emptyList(),
                                updatedUser.getCreatedAt(),
                                updatedUser.getUpdatedAt());
        }

        @Transactional
        public UpdateProfileImageResponse updateProfileImage(String email, String imageUrl) {
                log.info("프로필 이미지 수정: email={}", email);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

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
                                dto.getRegion()
                );

                return new LocationUpdateResponse(true, location);
        }
}
