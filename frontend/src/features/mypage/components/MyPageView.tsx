// 마이페이지
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import userApi from '@/shared/api/user/userApi';
import { authApi } from '@/shared/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import MeetingCard from '@/shared/components/ui/MeetingCard';
import Modal from '@/shared/components/ui/Modal';
import NotificationBell from '@/shared/components/ui/NotificationBell';
import logo from '@/assets/images/logo.png';
import { useMyPage, myPageKeys } from '../hooks/useMyPage';
import { useMyPageStore } from '../store/myPageStore';
import { useMeetings } from '@/features/meeting/hooks/useMeetings';
import type { MeetingUI } from '@/shared/types/Meeting.types';

const MyPageView: React.FC<{ onUnlike?: (id: number) => void }> = ({ onUnlike }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user); // ← authStore에서 직접 가져오기
  const { myMeetings, likedMeetings, isLoading, refetchLikedMeetings } = useMyPage();
  const { toggleLikeMeeting } = useMeetings();
  const clearUser = useMyPageStore((state) => state.clearUser);
  const logoutAuth = useAuthStore((state) => state.logout);

  // 로그아웃/회원탈퇴 모달 상태
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // 찜 목록 (1초 딜레이용)
  const [displayedLikedMeetings, setDisplayedLikedMeetings] = useState<MeetingUI[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // 페이지 진입 시 찜 목록 새로고침
  useEffect(() => {
    refetchLikedMeetings?.();
  }, [refetchLikedMeetings]);

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
        // useMeetings의 toggleLikeMeeting 사용 (자동으로 모든 캐시 무효화)
        toggleLikeMeeting(originalMeeting.groupId);
        // 찜 목록 강제 재조회
        await refetchLikedMeetings?.();
      }
      setDisplayedLikedMeetings(prev => prev.filter(m => m.id !== id));
      onUnlike?.(id);
    }, 1000);
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API failed:', error);
    }
    
    logoutAuth(); // Auth 스토어 초기화
    clearUser(); // MyPage 스토어 초기화
    
    // React Query 캐시 제거 (다음 로그인 시 이전 사용자 데이터 보임 방지)
    queryClient.removeQueries({ queryKey: myPageKeys.all });
    queryClient.removeQueries({ queryKey: ['meetings'] });
    
    setShowLogoutModal(false);
    console.log('로그아웃 완료');
    navigate('/');
  };

  // 회원탈퇴 핸들러
  const handleWithdraw = async () => {
    try {
      await userApi.deleteAccount();
      
      logoutAuth();
      clearUser();
      queryClient.removeQueries({ queryKey: myPageKeys.all });
      queryClient.removeQueries({ queryKey: ['meetings'] });
      
      setShowWithdrawModal(false);
      console.log('회원탈퇴 완료');
      navigate('/');
    } catch (error) {
      console.error('Withdraw failed:', error);
      alert('회원탈퇴 처리에 실패했습니다. 다시 시도해주세요.');
    }
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
<<<<<<< HEAD
<<<<<<< HEAD
        <NotificationBell />
=======
        <NotificationBell />
>>>>>>> 74261f27300a2d689100d448a9ba92202bc4b1c1
=======
        <NotificationBell />
>>>>>>> d954858af74f5928a60e0586f41638ba44e720fe
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar flex flex-col min-h-0">
        {/* Profile */}
        <section className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-start gap-4 relative">
            <ProfileImage src={authUser?.profileImage || ''} alt={authUser?.nickname || '사용자'} fallback={authUser?.nickname || '사용자'} size="lg" />
            <div className="flex-1 pt-1">
              <h2 className="text-base font-bold text-gray-900 mb-0.5">{authUser?.nickname || '이름 없음'}</h2>
              <p className="text-xs text-gray-500 mb-0.5">{authUser?.location?.region || '위치 없음'}</p>
              <p className="text-xs text-gray-600 mb-2">{authUser?.bio || '소개가 없습니다'}</p>
              <div className="flex flex-wrap gap-2">
                {authUser?.interests?.length ? (
                  authUser.interests.map((interest, i) => (
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
