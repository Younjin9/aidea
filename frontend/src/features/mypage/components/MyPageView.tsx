import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import MeetingCard from '@/shared/components/ui/MeetingCard';
import logo from '@/assets/images/logo.png';
import { useMyPage, transformMeetingsToUI } from '../hooks/useMyPage';
import type { MeetingUI } from '@/shared/types/Meeting.types';

interface MyPageViewProps {
  onUnlike?: (id: number) => void;
}

const MyPageView: React.FC<MyPageViewProps> = ({ onUnlike }) => {
  const navigate = useNavigate();
  const { user, myMeetings, likedMeetings, isLoading, unlikeMeeting } = useMyPage();

  // Meeting 타입을 MeetingUI로 변환
  const myMeetingsUI = React.useMemo(() => transformMeetingsToUI(myMeetings), [myMeetings]);
  const likedMeetingsUI = React.useMemo(() => transformMeetingsToUI(likedMeetings).map(m => ({ ...m, isLiked: true })), [likedMeetings]);

  // 로컬 state로 찜 목록 관리 (1초 딜레이용)
  const [displayedLikedMeetings, setDisplayedLikedMeetings] = React.useState<MeetingUI[]>([]);
  const timeoutRef = React.useRef<number | null>(null);
  const isInitializedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isInitializedRef.current && likedMeetingsUI.length > 0) {
      setDisplayedLikedMeetings(likedMeetingsUI);
      isInitializedRef.current = true;
    } else if (isInitializedRef.current) {
      setDisplayedLikedMeetings(likedMeetingsUI);
    }
  }, [likedMeetingsUI]);

  React.useEffect(() => {
    // 컴포넌트 언마운트 시 타이머 정리
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
      const meeting = displayedLikedMeetings.find(m => m.id === id);
      if (meeting) {
        // groupId 찾기
        const originalMeeting = likedMeetings.find(m => parseInt(m.groupId, 10) === id);
        if (originalMeeting) {
          unlikeMeeting(originalMeeting.groupId);
        }
      }
      setDisplayedLikedMeetings((prev) => prev.filter((meeting) => meeting.id !== id));
      onUnlike?.(id);
    }, 1000);
  };

  const renderMeetingCard = (meeting: MeetingUI, showLikeButton: boolean = false) => (
    <MeetingCard
      key={meeting.id}
      meeting={meeting}
      onClick={() => navigate(`/meetings/${meeting.id}`)}
      onLike={() => handleUnlike(meeting.id)}
      showLikeButton={showLikeButton}
    />
  );

  const renderMeetingSection = (
    title: string,
    meetings: MeetingUI[],
    showLikeButton: boolean,
    onViewAll: () => void,
    emptyMessage: string
  ) => (
    <div className="px-6 py-6 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <button onClick={onViewAll} className="text-xs text-gray-500">
          전체 보기
        </button>
      </div>
      {meetings.length > 0 ? (
        <div className="space-y-4">
          {meetings.map((meeting) => renderMeetingCard(meeting, showLikeButton))}
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-gray-400">{emptyMessage}</div>
      )}
    </div>
  );

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center">
        <div className="text-sm text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <img src={logo} alt="AIMO" className="w-8 h-8 object-contain" />
        <h1 className="text-lg font-bold text-gray-900">MyPage</h1>
        <div className="w-8" />
      </header>

      <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-start gap-4 relative">
            <ProfileImage
              src={user?.profileImage || ''}
              alt={user?.nickname || '사용자'}
              fallback={user?.nickname || '사용자'}
              size="lg"
            />

            <div className="flex-1 pt-1">
              <h2 className="text-base font-bold text-gray-900 mb-0.5">{user?.nickname || '이름 없음'}</h2>
              <p className="text-xs text-gray-500 mb-0.5">{user?.location?.region || '위치 없음'}</p>
              <p className="text-xs text-gray-600 mb-2">{user?.bio || '소개가 없습니다'}</p>
              <div className="flex flex-wrap gap-2">
                {user?.interests && user.interests.length > 0 ? (
                  user.interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-mint text-white text-xs rounded-full">
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">관심사 없음</span>
                )}
              </div>
            </div>

            <button onClick={() => navigate('/profile/edit')} className="absolute top-6 right-0 p-1">
              <Edit2 size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {renderMeetingSection(
          '내 모임',
          myMeetingsUI,
          false,
          () => navigate('/my-meetings'),
          '참여 중인 모임이 없습니다'
        )}

        {renderMeetingSection(
          '찜 목록',
          displayedLikedMeetings,
          true,
          () => navigate('/liked-meetings'),
          '찜한 모임이 없습니다'
        )}

        <div className="px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <button className="text-xs text-gray-400 underline">로그아웃</button>
            <span className="text-xs text-gray-300">·</span>
            <button className="text-xs text-gray-400 underline">회원탈퇴</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPageView;