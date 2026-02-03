import React, { useEffect, useState } from 'react';
import RecommendedMeetingCard from './RecommendedMeetingCard';

type RecommendedMeetingCardResponse = {
  meetingId: number;
  title: string;
  category: string;
  region: string;
  currentMembers: number;
  maxMembers: number;
  score: number;
  reason: string;
  imageUrl?: string; // 추가: 모임 이미지
};

const ShortsFeed: React.FC = () => {
  const [cards, setCards] = useState<RecommendedMeetingCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ JWT 토큰 확인
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('accessToken이 없습니다. (로그인/토큰 저장 로직을 확인해주세요)');
        }

        // ✅ 실제 API 호출
        const res = await fetch(
          `/api/recommendations?topK=10&limit=10&mode=vector`,
          {
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API 실패: ${res.status} ${text}`);
        }

        const data = (await res.json()) as RecommendedMeetingCardResponse[];
        setCards(data);
      } catch (e: any) {
        setError(e?.message ?? '알 수 없는 에러');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white">
        <p className="text-gray-400">추천 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white">
        <p className="text-red-400">에러: {error}</p>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white">
        <p className="text-gray-400">추천할 모임이 없습니다.</p>
      </div>
    );
  }

  // RecommendedMeetingCard 타입에 맞게 변환
  const meetingCards = cards.map(card => ({
    id: card.meetingId,
    title: card.title,
    image: card.imageUrl || `https://images.unsplash.com/photo-${card.meetingId}?q=80&w=400&auto=format&fit=crop`,
    location: card.region,
    category: card.category,
    members: card.currentMembers,
    description: card.reason,
    groupId: String(card.meetingId), // string으로 변환
    isLiked: false,
  }));

  return (
    <div className="absolute inset-0 w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
      {meetingCards.map((meeting) => (
        <div key={meeting.id} className="w-full h-full snap-start snap-always relative">
          <RecommendedMeetingCard meeting={meeting} />
        </div>
      ))}
    </div>
  );
};

export default ShortsFeed;