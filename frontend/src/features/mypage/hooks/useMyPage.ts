import { useState } from 'react';

interface User {
  nickname: string;
  profileImage: string;
  bio: string;
  interests: string[];
}

interface Meeting {
  id: number;
  image: string;
  title: string;
  category: string;
  location: string;
  members: number;
  date: string;
}

// TODO: 나중에 React Query로 대체
export const useMyPage = () => {
  const [user, setUser] = useState<User>({
    nickname: '김수현',
    profileImage: '',
    bio: '서울 중구',
    interests: ['여행하기 좋아요', '게임 좋아', '운동도 조아'],
  });

  const [myMeetings, setMyMeetings] = useState<Meeting[]>([
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      title: '홍대에 맛집 탐방',
      category: '맛집 투어',
      location: '서울 · 마포구',
      members: 4,
      date: '오늘 · 오후 6시 30분',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      title: '홍대에 치킨 탐방',
      category: '맛집 투어',
      location: '서울 · 마포구',
      members: 4,
      date: '오늘 · 오후 7시 30분',
    },
  ]);

  const [likedMeetings, setLikedMeetings] = useState<Meeting[]>([
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bde9be2b?w=400',
      title: '연트럴 시즌 구린너디',
      category: '운동/스포츠',
      location: '서울 · 중구',
      members: 10,
      date: '오늘 · 오후 7시 30분',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bde9be2b?w=400',
      title: '연트럴 시즌 구린너디',
      category: '운동/스포츠',
      location: '서울 · 중구',
      members: 10,
      date: '오늘 · 오후 8시 30분',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlikeMeeting = (id: number) => {
    setLikedMeetings((prev) => prev.filter((meeting) => meeting.id !== id));
  };

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: API 호출
      // const response = await fetch('/api/users/me');
      // const data = await response.json();
      // setUser(data);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError('프로필을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyMeetings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: API 호출
      // const response = await fetch('/api/users/me/meetings');
      // const data = await response.json();
      // setMyMeetings(data);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError('모임 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLikedMeetings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: API 호출
      // const response = await fetch('/api/users/me/liked-meetings');
      // const data = await response.json();
      // setLikedMeetings(data);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError('찜한 모임 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    myMeetings,
    likedMeetings,
    isLoading,
    error,
    unlikeMeeting,
    fetchUserProfile,
    fetchMyMeetings,
    fetchLikedMeetings,
  };
};