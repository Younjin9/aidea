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
                savedUser.getUserId(),
                savedUser.getEmail(),
                savedUser.getNickname(),
                savedUser.getPhoneNumber(),
                savedUser.getBirthDate(),
                savedUser.getGender(),
                savedUser.getProfileImage(),
                savedUser.getLocation(),
                savedUser.getLatitude(),
                savedUser.getLongitude(),
                savedUser.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public LoginResponse loginUser(UserLoginDto dto) {
        log.info("로그인 시도: email={}", dto.getEmail());

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("이메일이 일치하지 않습니다."));

        if (passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
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

        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                user.getEmail(),
                user.getNickname(),
                user.getPhoneNumber(),
                user.getGender()
        );

        log.info("로그인 성공: email={}", dto.getEmail());
        return new LoginResponse(accessToken, refreshToken, userInfo);
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

        return new TokenRefreshResponse(newAccessToken, newRefreshToken, 1800);
    }

    @Transactional
    public void logout(String email) {
        log.info("로그아웃 시도: email={}", email);

        refreshTokenRepository.deleteByEmail(email);

        log.info("로그아웃 완료: email={}", email);
    }
}
