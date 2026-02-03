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
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
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
                configuration.setAllowedHeaders(Arrays.asList(
                                "Origin", "Content-Type", "Accept", "Authorization",
                                "X-Requested-With", "X-Auth-Token", "Access-Control-Request-Method",
                                "Access-Control-Request-Headers"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                // Enable CORS
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // Disable CSRF (using JWT)
                                .csrf(AbstractHttpConfigurer::disable)

                                // ✅ JWT 기반 인증 - 세션 비활성화 (STATELESS)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // 세션 없이 JWT만 사용
                                )

                                // Public Endpoints
                                .authorizeHttpRequests(auth -> auth

                                                // Swagger
                                                .requestMatchers("/swagger-ui/**", "/swagger-ui.html",
                                                                "/v3/api-docs/**", "/swagger-resources/**")
                                                .permitAll()

                                                // WebSocket
                                                .requestMatchers("/ws/**", "/api/ws/**", "/app/**", "/topic/**")
                                                .permitAll()

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

                                                // Share
                                                .requestMatchers(HttpMethod.GET, "/api/share/**").permitAll()

                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oAuth2SuccessHandler))
                                // ✅ 인증되지 않은 API 요청 시 카카오로 리다이렉트하지 않고 401 반환
                                .exceptionHandling(e -> e
                                                .defaultAuthenticationEntryPointFor(
                                                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                                                new AntPathRequestMatcher("/api/**")))
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
