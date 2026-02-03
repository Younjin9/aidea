import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 페이지네이션으로 모임 데이터 불러오기
  const fetchCards = useCallback(async (pageNum: number) => {
    try {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      // ✅ JWT 토큰 확인
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('accessToken이 없습니다. (로그인/토큰 저장 로직을 확인해주세요)');
      }

      // ✅ 실제 API 호출 - 페이지당 10개 로드
      const res = await fetch(
        `/api/recommendations?page=${pageNum}&size=10&topK=10&mode=vector`,
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
      
      // 새 데이터 추가
      if (pageNum === 0) {
        setCards(data);
      } else {
        setCards(prev => [...prev, ...data]);
      }

      // 10개 미만이면 더 이상 데이터가 없음
      setHasMore(data.length >= 10);
    } catch (e: any) {
      setError(e?.message ?? '알 수 없는 에러');
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchCards(0);
  }, [fetchCards]);

  // 다음 페이지 로드
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1);
      fetchCards(page + 1);
    }
  }, [page, loadingMore, hasMore, fetchCards]);

  // Intersection Observer 설정 - 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMore]);

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
      {/* 무한 스크롤 트리거 */}
      <div ref={loadMoreRef} className="w-full h-1" />
      
      {/* 로딩 상태 */}
      {loadingMore && (
        <div className="w-full h-full flex items-center justify-center bg-black text-white snap-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
      
      {/* 더 이상 데이터 없음 */}
      {!hasMore && cards.length > 0 && (
        <div className="w-full h-full flex items-center justify-center bg-black text-white snap-center">
          <p className="text-gray-400">더 이상 추천할 모임이 없습니다.</p>
        </div>
      )}    </div>
  );
};

export default ShortsFeed;