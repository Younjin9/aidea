package com.aidea.backend.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import com.aidea.backend.global.secret.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.util.StringUtils;

/**
 * WebSocket 설정
 * - STOMP over WebSocket 활성화
 * - 메시지 브로커 설정
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider jwtTokenProvider;

    /**
     * STOMP 엔드포인트 등록
     * - 클라이언트가 WebSocket 연결할 경로 설정
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // WebSocket 연결 엔드포인트
                .setAllowedOriginPatterns("*") // CORS 허용 (개발 환경)
                .withSockJS(); // SockJS fallback 지원 (WebSocket 미지원 브라우저 대응)
    }

    /**
     * 메시지 브로커 설정
     * - Simple In-Memory Broker 사용
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 1. 클라이언트 → 서버 메시지 prefix
        config.setApplicationDestinationPrefixes("/app");

        // 2. 서버 → 클라이언트 브로드캐스트 prefix
        config.enableSimpleBroker("/topic", "/queue");

        // 3. 사용자별 메시지 prefix (선택)
        // config.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authToken = accessor.getFirstNativeHeader("Authorization");
                    log.debug("WebSocket CONNECT token: {}", authToken);

                    if (StringUtils.hasText(authToken) && authToken.startsWith("Bearer ")) {
                        String jwt = authToken.substring(7);
                        if (jwtTokenProvider.validateToken(jwt)) {
                            String email = jwtTokenProvider.getEmailFromToken(jwt);
                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    email, null, null);
                            accessor.setUser(authentication);
                            log.debug("WebSocket authentication success for user: {}", email);
                        }
                    }
                }
                return message;
            }
        });
    }
}
