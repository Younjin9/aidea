import React from 'react';
import ShortsFeed from '@/features/recommendation/components/ShortsFeed';

const ShortsPage: React.FC = () => {
  // ShortsFeed는 내부적으로 JWT 토큰 기반으로 추천 API 호출
  return <ShortsFeed />;
};

export default ShortsPage;