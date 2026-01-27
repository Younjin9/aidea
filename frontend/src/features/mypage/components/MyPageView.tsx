// 마이페이지
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import meetingApi from '@/shared/api/meeting/meetingApi';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import MeetingCard from '@/shared/components/ui/MeetingCard';
import Modal from '@/shared/components/ui/Modal';
import logo from '@/assets/images/logo.png';
import { useMyPage } from '../hooks/useMyPage';
import { useMyPageStore } from '../store/myPageStore';
import { useMeetingStore } from '@/features/meeting/store/meetingStore';
import type { MeetingUI } from '@/shared/types/Meeting.types';

const MyPageView: React.FC<{ onUnlike?: (id: number) => void }> = ({ onUnlike }) => {
  const navigate = useNavigate();
  const { user, myMeetings, likedMeetings, isLoading, unlikeMeeting } = useMyPage();
  const clearUser = useMyPageStore((state) => state.clearUser);
  const initializeMeetingMockData = useMeetingStore((state) => state.initializeMockData);

  // 로그아웃/회원탈퇴 모달 상태
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // 찜 목록 (1초 딜레이용)
  const [displayedLikedMeetings, setDisplayedLikedMeetings] = useState<MeetingUI[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // Meeting Mock 데이터 초기화
  useEffect(() => {
    initializeMeetingMockData();
  }, [initializeMeetingMockData]);

  useEffect(() => {
    if (!isInitializedRef.current && likedMeetings.length > 0) {
      setDisplayedLikedMeetings(likedMeetings);
      isInitializedRef.current = true;
    } else if (isInitializedRef.current) {
      setDisplayedLikedMeetings(likedMeetings);
    }
  }, [likedMeetings]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const handleUnlike = (id: number) => {
    setDisplayedLikedMeetings(prev => prev.map(m => m.id === id ? { ...m, isLiked: false } : m));

    timeoutRef.current = window.setTimeout(async () => {
      const originalMeeting = likedMeetings.find(m => parseInt(m.groupId, 10) === id);
      if (originalMeeting) {
        try {
          // 실제 API 호출
          await meetingApi.unlike(originalMeeting.groupId);
        } catch (error) {
          console.error('찜 취소 실패:', error);
        }
        unlikeMeeting(originalMeeting.groupId);
      }
      setDisplayedLikedMeetings(prev => prev.filter(m => m.id !== id));
      onUnlike?.(id);
    }, 1000);
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    clearUser();
    setShowLogoutModal(false);
    // TODO: API 호출 (토큰 삭제 등)
    console.log('로그아웃 완료');
    navigate('/');
  };

  // 회원탈퇴 핸들러
  const handleWithdraw = () => {
    clearUser();
    setShowWithdrawModal(false);
    // TODO: API 호출 (회원탈퇴 요청)
    console.log('회원탈퇴 완료');
    navigate('/');
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
          {myMeetings.length > 0 ? (
            <div className="space-y-4">
              {myMeetings.slice(0, 2).map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} onClick={() => navigate(`/meetings/${meeting.groupId}`)} showLikeButton={false} />
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
              {displayedLikedMeetings.slice(0, 2).map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} onClick={() => navigate(`/meetings/${meeting.groupId}`)} onLike={() => handleUnlike(meeting.id)} showLikeButton />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">찜한 모임이 없습니다</p>
          )}
        </section>

        {/* 로그아웃/회원탈퇴 */}
        <div className="px-6 py-8 mt-auto flex items-center justify-center gap-2">
          <button onClick={() => setShowLogoutModal(true)} className="text-xs text-gray-400 underline">로그아웃</button>
          <span className="text-xs text-gray-300">·</span>
          <button onClick={() => setShowWithdrawModal(true)} className="text-xs text-gray-400 underline">회원탈퇴</button>
        </div>
      </main>

      {/* 로그아웃 확인 모달 */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        showLogo={true}
        message="로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* 회원탈퇴 확인 모달 */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        showLogo={true}
        title="회원탈퇴"
        message="탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다."
        showCheckbox={true}
        checkboxLabel="위 내용을 확인했습니다"
        confirmText="탈퇴"
        cancelText="취소"
        onConfirm={handleWithdraw}
        onCancel={() => setShowWithdrawModal(false)}
      />
    </div>
  );
};

export default MyPageView;
