package com.aidea.backend.global.config;

import com.aidea.backend.domain.meeting.entity.enums.MemberStatus;
import com.aidea.backend.domain.meeting.repository.MeetingMemberRepository;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.repository.UserRepository;
import com.aidea.backend.global.secret.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;

/**
 * WebSocket 설정
 * - STOMP over WebSocket 활성화
 * - 메시지 브로커 설정
 * - 보안 인터셉터 (CONNECT, SUBSCRIBE)
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider jwtTokenProvider;
    private final MeetingMemberRepository meetingMemberRepository;
    private final UserRepository userRepository;

    /**
     * STOMP 엔드포인트 등록
     * - 클라이언트가 WebSocket 연결할 경로 설정
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/api/ws") // WebSocket 연결 엔드포인트를 /api 하위로 변경 (프록시 접근성 허용)
                .setAllowedOriginPatterns("*") // CORS 허용 패턴 (패턴 기반 허용으로 유연성 확보)
                .withSockJS(); // SockJS fallback 지원
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
                } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    String destination = accessor.getDestination();
                    Principal principal = accessor.getUser();

                    if (principal == null) {
                        throw new AccessDeniedException("인증되지 않은 사용자입니다.");
                    }

                    // Destination format: /topic/meeting/{meetingId}
                    if (destination != null && destination.startsWith("/topic/meeting/")) {
                        try {
                            String meetingIdStr = destination.substring("/topic/meeting/".length());
                            Long meetingId = Long.parseLong(meetingIdStr);
                            String email = principal.getName();

                            User user = userRepository.findByEmail(email)
                                    .orElseThrow(() -> new AccessDeniedException("사용자를 찾을 수 없습니다."));

                            boolean isMember = meetingMemberRepository.existsByMeetingIdAndUser_UserIdAndStatus(
                                    meetingId, user.getUserId(), MemberStatus.APPROVED);

                            if (!isMember) {
                                log.warn("Access Denied: User {} tried to subscribe to meeting {}", email, meetingId);
                                throw new AccessDeniedException("모임 멤버만 채팅에 참여할 수 있습니다.");
                            }
                        } catch (NumberFormatException e) {
                            log.error("Invalid meeting ID format in destination: {}", destination);
                        }
                    }
                }
                return message;
            }
        });
    }
}
