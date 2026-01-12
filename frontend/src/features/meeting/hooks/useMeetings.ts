import { useState } from 'react';

interface Meeting {
  id: number;
  image: string;
  title: string;
  category: string;
  location: string;
  members: number;
  date: string;
  isLiked: boolean;
}

// TODO: 나중에 React Query로 대체
export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      title: '홍대에 맛집 탐방',
      category: '맛집 투어',
      location: '서울 · 마포구',
      members: 4,
      date: '오늘 · 오후 6시 30분',
      isLiked: false,
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      title: '홍대에 치킨 탐방',
      category: '맛집 투어',
      location: '서울 · 마포구',
      members: 4,
      date: '오늘 · 오후 7시 30분',
      isLiked: false,
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      title: '홍대에 치킨 탐방',
      category: '맛집 투어',
      location: '서울 · 마포구',
      members: 4,
      date: '오늘 · 오후 8시 30분',
      isLiked: false,
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bde9be2b?w=400',
      title: '연트럴 시즌 구린너디',
      category: '운동/스포츠',
      location: '서울 · 중구',
      members: 10,
      date: '오늘 · 오후 7시 30분',
      isLiked: false,
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bde9be2b?w=400',
      title: '연트럴 시즌 구린너디',
      category: '운동/스포츠',
      location: '서울 · 중구',
      members: 10,
      date: '오늘 · 오후 8시 30분',
      isLiked: false,
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
      title: '한남 장가지 모집',
      category: '액티비티/스포츠',
      location: '서울 · 용산구',
      members: 12,
      date: '오늘 · 오후 7시 30분',
      isLiked: false,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = (id: number) => {
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === id ? { ...meeting, isLiked: !meeting.isLiked } : meeting
      )
    );
  };

  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: API 호출
      // const response = await fetch('/api/meetings');
      // const data = await response.json();
      // setMeetings(data);
      
      // 임시로 mock 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError('모임을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    meetings,
    isLoading,
    error,
    toggleLike,
    fetchMeetings,
  };
};