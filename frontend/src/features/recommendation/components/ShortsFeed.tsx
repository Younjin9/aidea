import React, { useEffect, useState } from 'react';

type RecommendedMeetingCardResponse = {
  meetingId: number;
  title: string;
  category: string;
  region: string;
  currentMembers: number;
  maxMembers: number;
  score: number;
  reason: string;
};

type ShortsFeedProps = {
  topK?: number;
  limit?: number;
  mode?: 'vector' | 'basic' | 'mvp';
};

const ShortsFeed: React.FC<ShortsFeedProps> = ({
  topK = 10,
  limit = 10,
  mode = 'vector',
}) => {
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

        // ✅ nickname 제거, mode=vector 기반 추천
        const res = await fetch(
          `/api/recommendations?topK=${topK}&limit=${limit}&mode=${mode}`,
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
  }, [topK, limit, mode]);

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

  return (
    <div className="absolute inset-0 w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
      {cards.map((card) => (
        <div
          key={card.meetingId}
          className="w-full h-full snap-start snap-always relative flex items-center justify-center"
        >
          <div className="w-[90%] max-w-md rounded-2xl p-6 bg-zinc-900 text-white">
            <h2 className="text-xl font-bold mb-2">{card.title}</h2>

            <p className="text-sm text-gray-300 mb-2">
              {card.region} · {card.category}
            </p>

            <p className="text-sm text-gray-300 mb-2">
              인원: {card.currentMembers}/{card.maxMembers}
            </p>

            <p className="text-sm text-gray-300 mb-2">
              점수: {Number.isFinite(card.score) ? card.score.toFixed(2) : '0.00'}
            </p>

            <p className="text-sm text-gray-200 mt-4">{card.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShortsFeed;