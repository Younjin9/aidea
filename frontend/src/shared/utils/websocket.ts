/**
 * 환경별 WebSocket URL을 동적으로 감지하여 반환합니다.
 */
export const getWebSocketUrl = () => {
    const { protocol, hostname } = window.location;

    // 개발 환경 (localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'ws://localhost:8080/ws/websocket';
    }

    // 배포 환경
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

    // CloudFront CDN인 경우 원본 도메인으로 직접 연결하거나 설정된 별칭 사용
    if (hostname.includes('cloudfront.net')) {
        return 'wss://aimo.ai.kr/ws/websocket';
    }

    // aimo.ai.kr, www.aimo.ai.kr 등 지원
    const domain = hostname.includes('aimo.ai.kr') ? 'aimo.ai.kr' : hostname;
    return `${wsProtocol}//${domain}/ws/websocket`;
};
