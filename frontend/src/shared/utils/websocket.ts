/**
 * 환경별 WebSocket URL을 동적으로 감지하여 반환합니다.
 */
export const getWebSocketUrl = () => {
    // 1. 환경 변수가 설정되어 있으면 최우선 사용
    const envWsUrl = import.meta.env.VITE_WS_URL;
    if (envWsUrl) {
        // 도메인만 있는 경우 (e.g. wss://aimo.ai.kr) 기본 경로 보정
        return envWsUrl.endsWith('/') ? `${envWsUrl}api/ws` : (envWsUrl.includes('/api/') || envWsUrl.endsWith('/ws') ? envWsUrl : `${envWsUrl}/api/ws`);
    }

    const { protocol, hostname } = window.location;

    // 2. 개발 환경 (localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'ws://localhost:8080/api/ws';
    }

    // 3. 배포 환경 (동적 감지)
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    const domain = hostname.includes('aimo.ai.kr') || hostname.includes('cloudfront.net')
        ? 'aimo.ai.kr'
        : hostname;

    return `${wsProtocol}//${domain}/api/ws`;
};
