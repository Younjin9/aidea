// 마이페이지
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import MeetingCard from '@/shared/components/ui/MeetingCard';
import logo from '@/assets/images/logo.png';
import { useMyPage, transformMeetingsToUI } from '../hooks/useMyPage';
import type { MeetingUI } from '@/shared/types/Meeting.types';

const MyPageView: React.FC<{ onUnlike?: (id: number) => void }> = ({ onUnlike }) => {
  const navigate = useNavigate();
  const { user, myMeetings, likedMeetings, isLoading, unlikeMeeting } = useMyPage();

  // Meeting 타입을 MeetingUI로 변환
  const myMeetingsUI = useMemo(() => transformMeetingsToUI(myMeetings), [myMeetings]);
  const likedMeetingsUI = useMemo(() => transformMeetingsToUI(likedMeetings).map(m => ({ ...m, isLiked: true })), [likedMeetings]);

  // 찜 목록 (1초 딜레이용)
  const [displayedLikedMeetings, setDisplayedLikedMeetings] = useState<MeetingUI[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current && likedMeetingsUI.length > 0) {
      setDisplayedLikedMeetings(likedMeetingsUI);
      isInitializedRef.current = true;
    } else if (isInitializedRef.current) {
      setDisplayedLikedMeetings(likedMeetingsUI);
    }
  }, [likedMeetingsUI]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const handleUnlike = (id: number) => {
    setDisplayedLikedMeetings(prev => prev.map(m => m.id === id ? { ...m, isLiked: false } : m));

    timeoutRef.current = window.setTimeout(() => {
      const originalMeeting = likedMeetings.find(m => parseInt(m.groupId, 10) === id);
      if (originalMeeting) unlikeMeeting(originalMeeting.groupId);
      setDisplayedLikedMeetings(prev => prev.filter(m => m.id !== id));
      onUnlike?.(id);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center">
        <p className="text-sm text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <img src={logo} alt="AIMO" className="w-8 h-8 object-contain" />
        <h1 className="text-lg font-bold text-gray-900">MyPage</h1>
        <div className="w-8" />
      </header>

      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar flex flex-col min-h-0">
        {/* Profile */}
        <section className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-start gap-4 relative">
            <ProfileImage src={user?.profileImage || ''} alt={user?.nickname || '사용자'} fallback={user?.nickname || '사용자'} size="lg" />
            <div className="flex-1 pt-1">
              <h2 className="text-base font-bold text-gray-900 mb-0.5">{user?.nickname || '이름 없음'}</h2>
              <p className="text-xs text-gray-500 mb-0.5">{user?.location?.region || '위치 없음'}</p>
              <p className="text-xs text-gray-600 mb-2">{user?.bio || '소개가 없습니다'}</p>
              <div className="flex flex-wrap gap-2">
                {user?.interests?.length ? (
                  user.interests.map((interest, i) => (
                    <span key={i} className="px-3 py-1 bg-mint text-white text-xs rounded-full">{interest}</span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">관심사 없음</span>
                )}
              </div>
            </div>
            <button onClick={() => navigate('/mypage/edit')} className="absolute top-6 right-0 p-1">
              <Edit2 size={16} className="text-gray-600" />
            </button>
          </div>
        </section>

        {/* 내 모임 */}
        <section className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">내 모임</h3>
            <button onClick={() => navigate('/my-meetings')} className="text-xs text-gray-500">전체 보기</button>
          </div>
          {myMeetingsUI.length > 0 ? (
            <div className="space-y-4">
              {myMeetingsUI.map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} onClick={() => navigate(`/meetings/${meeting.id}`)} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">참여 중인 모임이 없습니다</p>
          )}
        </section>

        {/* 찜 목록 */}
        <section className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">찜 목록</h3>
            <button onClick={() => navigate('/my-meetings?tab=liked')} className="text-xs text-gray-500">전체 보기</button>
          </div>
          {displayedLikedMeetings.length > 0 ? (
            <div className="space-y-4">
              {displayedLikedMeetings.map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} onClick={() => navigate(`/meetings/${meeting.id}`)} onLike={() => handleUnlike(meeting.id)} showLikeButton />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">찜한 모임이 없습니다</p>
          )}
        </section>

        {/* 로그아웃/회원탈퇴 */}
        <div className="px-6 py-8 mt-auto flex items-center justify-center gap-2">
          <button className="text-xs text-gray-400 underline">로그아웃</button>
          <span className="text-xs text-gray-300">·</span>
          <button className="text-xs text-gray-400 underline">회원탈퇴</button>
        </div>
      </main>
    </div>
  );
};

export default MyPageView;
