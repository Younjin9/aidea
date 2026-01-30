/**
 * 환경별 WebSocket URL을 동적으로 감지하여 반환합니다.
 */
export const getWebSocketUrl = () => {
    const { protocol, hostname } = window.location;

    // 개발 환경 (localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'ws://localhost:8080/api/ws/websocket';
    }

    // 배포 환경
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

    // CloudFront CDN 또는 운영 도메인
    const domain = hostname.includes('aimo.ai.kr') || hostname.includes('cloudfront.net')
        ? 'aimo.ai.kr'
        : hostname;

    return `${wsProtocol}//${domain}/api/ws/websocket`;
};
