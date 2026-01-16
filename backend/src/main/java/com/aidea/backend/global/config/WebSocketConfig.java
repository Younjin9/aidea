package com.aidea.backend.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket 설정
 * - STOMP over WebSocket 활성화
 * - 메시지 브로커 설정
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

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
}
