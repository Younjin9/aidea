package com.aidea.backend.global.config;

import com.aidea.backend.global.secret.jwt.JwtAuthenticationFilter;
import com.aidea.backend.global.secret.oauth.CustomOAuth2UserService;
import com.aidea.backend.global.secret.oauth.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final CustomOAuth2UserService customOAuth2UserService;
        private final OAuth2SuccessHandler oAuth2SuccessHandler;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                // Disable CSRF (using JWT)
                                .csrf(AbstractHttpConfigurer::disable)

                                // ✅ OAuth2를 위한 세션 허용 (가장 중요한 수정!)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // 필요시 세션 생성
                                                .maximumSessions(1) // 동시 세션 1개 제한
                                                .maxSessionsPreventsLogin(false) // 새 로그인 시 기존 세션 만료
                                )

                                // Public Endpoints
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/", // ✅ 메인 페이지 추가 (성공 후 리다이렉트 경로)
                                                                "/home", // 홈 페이지
                                                                "/test/login",
                                                                "/test/**",
                                                                "/api/v1/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/v3/api-docs/**", // ✅ Swagger API 문서
                                                                "/swagger-resources/**", // ✅ Swagger 리소스
                                                                "/ws/**", // ✅ WebSocket 연결
                                                                "/app/**", // ✅ STOMP 메시지
                                                                "/topic/**", // ✅ STOMP 브로드캐스트
                                                                "/login/oauth2/**", // OAuth2 콜백 경로
                                                                "/oauth2/**", // OAuth2 인증 경로
                                                                "/error" // 에러 페이지
                                                ).permitAll()
                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oAuth2SuccessHandler))
                                .addFilterBefore(jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
