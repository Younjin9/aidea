// 마이페이지
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Edit2 } from 'lucide-react';
import meetingApi from '@/shared/api/meeting/meetingApi';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import MeetingCard from '@/shared/components/ui/MeetingCard';
import Modal from '@/shared/components/ui/Modal';
import logo from '@/assets/images/logo.png';
import { useMyPage, myPageKeys } from '../hooks/useMyPage';
import { useMyPageStore } from '../store/myPageStore';
import { useMeetingStore } from '@/features/meeting/store/meetingStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/shared/api/authApi';
import userApi from '@/shared/api/user/userApi';
import type { MeetingUI } from '@/shared/types/Meeting.types';

const MyPageView: React.FC<{ onUnlike?: (id: number) => void }> = ({ onUnlike }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, myMeetings, likedMeetings, isLoading, unlikeMeeting, refetchLikedMeetings } = useMyPage();
  const clearUser = useMyPageStore((state) => state.clearUser);
  const initializeMeetingMockData = useMeetingStore((state) => state.initializeMockData);
  const logoutAuth = useAuthStore((state) => state.logout);

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

  const handleSetting = () => {
    // navigate('/settings'); // 설정 페이지가 있다면
    alert('설정 기능 준비 중입니다.');
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
        <div className="w-8" />
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar flex flex-col min-h-0">
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
                <MeetingCard key={meeting.id} meeting={meeting} onClick={() => navigate(/meetings/)} showLikeButton={false} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">참여 중인 모임이 없습니다</p>
          )}
        </section>

        {/* 찜 목록 */}
        <section className="px-6 py-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">찜한 모임</h3>
          {displayedLikedMeetings.length > 0 ? (
            <div className="space-y-4">
              {displayedLikedMeetings.map(meeting => (
                <MeetingCard 
                  key={meeting.id} 
                  meeting={meeting} 
                  onClick={() => navigate(/meetings/)}
                  isLiked={meeting.isLiked}
                  onToggleLike={() => handleUnlike(parseInt(meeting.groupId, 10))}
                />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">찜한 모임이 없습니다</p>
          )}
        </section>

        {/* 설정 목록 */}
        <section className="px-6 py-6">
          <ul className="space-y-4">
            <li>
              <button 
                onClick={handleSetting}
                className="w-full text-left text-sm text-gray-600 hover:text-gray-900"
              >
                환경설정
              </button>
            </li>
            <li>
              <button onClick={() => setShowLogoutModal(true)} className="w-full text-left text-sm text-gray-600 hover:text-gray-900">로그아웃</button>
            </li>
            <li>
              <button onClick={() => setShowWithdrawModal(true)} className="text-xs text-gray-400 underline">회원탈퇴</button>
            </li>
          </ul>
        </section>
      </main>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="로그아웃"
        content="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="회원탈퇴"
        content="정말 탈퇴하시겠습니까? 탈퇴 시 모든 데이터가 삭제됩니다."
        confirmText="탈퇴하기"
        onConfirm={handleWithdraw}
        onCancel={() => setShowWithdrawModal(false)}
      />
    </div>
  );
};

export default MyPageView;
