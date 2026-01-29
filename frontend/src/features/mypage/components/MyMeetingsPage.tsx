import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BackButton from '@/shared/components/ui/BackButton';
import MeetingCard from '@/shared/components/ui/MeetingCard';
import { useMyPage } from '../hooks/useMyPage';
import { useMeetings } from '@/features/meeting/hooks/useMeetings';
import type { MeetingUI } from '@/shared/types/Meeting.types';

type TabType = 'my' | 'liked';

const MyMeetingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'liked' ? 'liked' : 'my';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // 탭 변경 시 URL 파라미터도 업데이트
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  const { myMeetings, likedMeetings, isLoading, refetchLikedMeetings } = useMyPage();
  const { toggleLikeMeeting } = useMeetings();

  // 찜 목록 로컬 state (1초 딜레이용)
  const [displayedLikedMeetings, setDisplayedLikedMeetings] = useState<MeetingUI[]>([]);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayedLikedMeetings(likedMeetings);
  }, [likedMeetings]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleUnlike = (id: number) => {
    // 먼저 하트를 빈 하트로 변경
    setDisplayedLikedMeetings((prev) =>
      prev.map((meeting) => (meeting.id === id ? { ...meeting, isLiked: false } : meeting))
    );

    // 1초 후에 목록에서 제거 및 API 호출
    timeoutRef.current = window.setTimeout(() => {
      const originalMeeting = likedMeetings.find(m => m.id === id);
      if (originalMeeting) {
        // useMeetings의 toggleLikeMeeting 사용 (자동으로 모든 캐시 무효화)
        toggleLikeMeeting(originalMeeting.groupId, true);
        // 찜 목록 다시 조회
        refetchLikedMeetings();
      }
      setDisplayedLikedMeetings((prev) => prev.filter((meeting) => meeting.id !== id));
    }, 1000);
  };

  const currentMeetings = activeTab === 'my' ? myMeetings : displayedLikedMeetings;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10">
        <div className="flex items-center justify-center p-4 relative">
          <div className="absolute left-4">
            <BackButton />
          </div>
          <h1 className="font-semibold text-base">나의 모임</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange('my')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'my'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-500'
              }`}
          >
            내 모임
          </button>
          <button
            onClick={() => handleTabChange('liked')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'liked'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-500'
              }`}
          >
            찜 모임
          </button>
        </div>
      </div>

      {/* Meeting List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {currentMeetings.length > 0 ? (
          <div className="space-y-4">
            {currentMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onClick={() => navigate(`/meetings/${meeting.groupId}`)}
                onLike={activeTab === 'liked' ? () => handleUnlike(meeting.id) : undefined}
                showLikeButton={activeTab === 'liked'}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-400">
              {activeTab === 'my' ? '참여 중인 모임이 없습니다' : '찜한 모임이 없습니다'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMeetingsPage;
