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
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

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
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList(
                                "http://localhost:5173", "http://localhost:5174",
                                "http://localhost:3000", "http://localhost:3001",
                                "https://aimo.ai.kr", "https://www.aimo.ai.kr",
                                "https://d125n74xsjeyc3.cloudfront.net"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("*"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/api/**", configuration);
                return source;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                // Enable CORS
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

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

                                                // Swagger
                                                .requestMatchers("/swagger-ui/**", "/swagger-ui.html",
                                                                "/v3/api-docs/**", "/swagger-resources/**")
                                                .permitAll()

                                                // WebSocket
                                                .requestMatchers("/ws/**", "/app/**", "/topic/**").permitAll()

                                                // Health Check
                                                .requestMatchers("/actuator/**", "/health").permitAll()

                                                // OAuth2
                                                .requestMatchers("/login/oauth2/**", "/oauth2/**").permitAll()

                                                // User
                                                .requestMatchers("/api/users/join", "/api/users/login",
                                                                "/api/users/nickname-check", "/api/users/refresh",
                                                                "/api/users/health")
                                                .permitAll()

                                                // Interest
                                                .requestMatchers(HttpMethod.GET, "/api/interests").permitAll()

                                                // Group
                                                .requestMatchers(HttpMethod.GET, "/api/groups", "/api/groups/{id}",
                                                                "/api/groups/search", "/api/groups/{id}/members")
                                                .permitAll()

                                                // Chat (For Testing)
                                                .requestMatchers("/api/chat/**").permitAll()

                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oAuth2SuccessHandler))
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
