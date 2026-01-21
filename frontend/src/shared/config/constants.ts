export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_KAKAO_REDIRECT_URI}&response_type=code`;

export const INTEREST_CATEGORIES = [
  {
    id: 'hobby',
    label: '취미 / 여가',
    icon: '🎯',
    items: ['만들기 / DIY', '보드게임 / 퍼즐', '사진 / 기록', '글쓰기 / 독서', '취미 공유', '체험 활동'],
  },
  {
    id: 'sports',
    label: '운동 / 액티비티',
    icon: '🏃',
    items: ['가벼운 운동', '야외 활동', '팀 스포츠', '개인 운동', '도전 / 챌린지'],
  },
  {
    id: 'culture',
    label: '문화 / 예술',
    icon: '🎨',
    items: ['전시 / 관람', '창작 활동', '예술 취향 공유', '공연 / 행사', '디자인 / 미감'],
  },
  {
    id: 'self_improvement',
    label: '자기계발 / 공부',
    icon: '📚',
    items: ['스터디', '습관 형성', '지식 공유', '목표 관리', '커리어 탐색'],
  },
  {
    id: 'travel',
    label: '여행 / 나들이',
    icon: '✈️',
    items: ['근교 나들이', '산책 / 걷기', '맛집 탐방', '기록 여행', '테마 여행'],
  },
  {
    id: 'contents',
    label: '콘텐츠 / 미디어',
    icon: '🎬',
    items: ['영화 / 드라마', '애니 / 만화', '게임', '유튜브 / 스트리밍', '콘텐츠 토크'],
  },
] as const;
