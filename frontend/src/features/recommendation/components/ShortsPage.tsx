import React from 'react';
import ShortsFeed from '@/features/recommendation/components/ShortsFeed';
import { useAuthStore } from '@/features/auth/store/authStore';

const ShortsPage: React.FC = () => {
  const nickname = useAuthStore((s) => s.user?.nickname ?? '');

  // 필요하면 여기서 기본값 조정 가능
  const topK = 10;
  const limit = 10;

  // AI 추천 탭/숏폼 추천이면 vector
  const mode: 'vector' | 'mvp' = 'vector';

  // 닉네임이 없으면(로그인 전/스토어 미세팅) 안내
  if (!nickname) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white">
        <p className="text-gray-400">로그인 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return <ShortsFeed nickname={nickname} topK={topK} limit={limit} mode={mode} />;
};

export default ShortsPage;