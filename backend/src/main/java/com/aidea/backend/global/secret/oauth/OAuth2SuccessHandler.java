package com.aidea.backend.global.secret.oauth;

import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.repository.UserRepository;
import com.aidea.backend.global.secret.jwt.JwtTokenProvider;
import com.aidea.backend.global.secret.jwt.RefreshToken;
import com.aidea.backend.global.secret.jwt.RefreshTokenRepository;
import com.aidea.backend.global.secret.oauth.user.KakaoUserInfo;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Value("${app.oauth2.authorized-redirect-uris:http://localhost:5173/oauth/callback}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // OAuth2 Provider 확인 (kakao)
        String registrationId = ((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId();

        String email = null;
        if ("kakao".equals(registrationId)) {
            KakaoUserInfo kakaoUserInfo = new KakaoUserInfo(oAuth2User.getAttributes());
            email = kakaoUserInfo.getEmail();
        }

        // 이메일이 없는 경우 처리 (카카오 계정에 이메일이 없는 경우 등)
        if (email == null) {
            throw new IllegalArgumentException("이메일을 찾을 수 없습니다.");
        }

        log.info("OAuth2 Login Success. Generating Tokens for: {}", email);

        // Access Token & Refresh Token 생성
        String accessToken = jwtTokenProvider.createAccessToken(email);
        String refreshToken = jwtTokenProvider.createRefreshToken(email);

        // Refresh Token을 Redis에 저장
        User user = userRepository.findByEmail(email).orElseThrow();
        refreshTokenRepository.deleteByEmail(email); // 기존 토큰 삭제
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .token(refreshToken)
                .email(email)
                .userId(user.getUserId())
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        // Frontend로 리다이렉트 (두 토큰 모두 전달)
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
