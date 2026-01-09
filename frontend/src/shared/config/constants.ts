export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_KAKAO_REDIRECT_URI}&response_type=code`;

export const INTEREST_CATEGORIES = [
  {
    id: 'sports',
    label: '운동/스포츠',
    icon: '⚽',
    items: ['축구', '풋살', '헬스', '배드민턴', '볼링'],
  },
  {
    id: 'outdoor',
    label: '아웃도어/여행',
    icon: '✈️',
    items: ['등산', '캠핑', '국내여행', '해외여행', '낚시'],
  },
  {
    id: 'humanities',
    label: '인문학/책/글',
    icon: '📚',
    items: ['독서모임', '글쓰기', '토론', '철학'],
  },
  {
    id: 'language',
    label: '외국어/언어',
    icon: '🗣️',
    items: ['영어회화(OPIc)', '일본어', '언어교환'],
  },
  {
    id: 'music',
    label: '음악/악기',
    icon: '🎵',
    items: ['노래', '밴드', '기타', '피아노', '작곡'],
  },
  {
    id: 'culture',
    label: '문화/공연/축제',
    icon: '🎨',
    items: ['전시회 관람', '뮤지컬', '영화', '콘서트', '연극'],
  },
  {
    id: 'crafts',
    label: '공예/만들기',
    icon: '🧶',
    items: ['가죽공예', '목공', '도자기', '캘리그라피', '요리'],
  },
  {
    id: 'dance',
    label: '댄스/무용',
    icon: '💃',
    items: ['방송댄스', '라틴댄스', '발레', '스윙'],
  },
  {
    id: 'photography',
    label: '사진/영상',
    icon: '📸',
    items: ['출사', '영상 편집', '숏폼 제작'],
  },
  {
    id: 'social',
    label: '사교/인맥',
    icon: '🤝',
    items: ['직장인 모임', '와인 파티', '맛집 탐방', '또래 모임'],
  },
] as const;
