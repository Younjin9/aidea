// 마이페이지
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Edit2 } from 'lucide-react';
import { authApi } from '@/shared/api/authApi';
import userApi from '@/shared/api/user/userApi';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import MeetingCard from '@/shared/components/ui/MeetingCard';
import Modal from '@/shared/components/ui/Modal';
import logo from '@/assets/images/logo.png';
import { useMyPage, myPageKeys } from '../hooks/useMyPage';
import { useMyPageStore } from '../store/myPageStore';
import { useMeetingStore } from '@/features/meeting/store/meetingStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMeetings } from '@/features/meeting/hooks/useMeetings';
import type { MeetingUI } from '@/shared/types/Meeting.types';

const MyPageView: React.FC<{ onUnlike?: (id: number) => void }> = ({ onUnlike }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { likedMeetings, isLoading, refetchLikedMeetings } = useMyPage();
  const user = useAuthStore((state) => state.user);
  const clearUser = useMyPageStore((state) => state.clearUser);
  const logoutAuth = useAuthStore((state) => state.logout);
  const { toggleLikeMeeting } = useMeetings();

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
        toggleLikeMeeting(originalMeeting.groupId, true);
        // 찜 목록 강제 재조회
        await refetchLikedMeetings?.();
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
      {/* 1. 상단 프로필 영역 */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             {/* ProfileImage가 fileUrl뿐 아니라 일반 string, 혹은 undef도 처리한다고 가정 */}
            <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100">
               <ProfileImage 
                 className="w-full h-full object-cover" 
                 src={user?.profileImage} 
               />
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-1">
                {user?.nickname || '사용자'} 
                <button onClick={() => navigate('/mypage/edit')}>
                   <Edit2 size={16} className="text-gray-400" />
                </button>
              </h1>
              <p className="text-sm text-gray-500">
                {user?.bio || '자기소개가 없습니다.'}
              </p>
            </div>
          </div>
        </div>

        {/* 메뉴 아이콘들 (설정 등) */}
        <div className="flex justify-end gap-2 mb-4">
           {/* 필요 시 추가 */}
        </div>
      </div>

      <div className="h-2 bg-gray-50 mb-4" />

      {/* 2. 찜한 모임 */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">찜한 모임</h2>
          {/* 전체보기 등 필요시 */}
        </div>
        
        {displayedLikedMeetings.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg">
            찜한 모임이 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayedLikedMeetings.slice(0, 3).map((meeting) => (
              <MeetingCard 
                key={meeting.id} 
                meeting={meeting}
                onLike={() => handleUnlike(meeting.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="h-2 bg-gray-50 mb-4" />

      {/* 3. 내 모임 관리 */}
      <div className="px-6 space-y-4 mb-10">
        <button 
          onClick={() => navigate('/my-meetings')}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <span className="font-medium">내 모임 관리</span>
          <span className="text-gray-400">›</span>
        </button>
        <button 
          onClick={handleSetting}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <span className="font-medium">설정</span>
          <span className="text-gray-400">›</span>
        </button>
         <button 
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center justify-between w-full py-2 text-left text-red-500"
        >
          <span className="font-medium">로그아웃</span>
          <span className="text-gray-400">›</span>
        </button>
        <div className="pt-4 border-t border-gray-100">
          <button 
             onClick={() => setShowWithdrawModal(true)}
             className="text-xs text-gray-400 underline"
          >
            회원탈퇴
          </button>
        </div>
      </div>

      {/* 로그아웃 모달 */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="로그아웃"
      >
        <div className="text-center">
          <p className="mb-6 text-gray-600">정말 로그아웃 하시겠습니까?</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-3 text-gray-500 bg-gray-100 rounded-lg font-medium"
            >
              취소
            </button>
            <button 
              onClick={handleLogout}
              className="flex-1 py-3 text-white bg-primary rounded-lg font-medium"
            >
              로그아웃
            </button>
          </div>
        </div>
      </Modal>

      {/* 회원탈퇴 모달 */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="회원탈퇴"
      >
        <div className="text-center">
          <div className="mb-6">
             <img src={logo} alt="logo" className="w-12 h-12 mx-auto mb-2 opacity-50 grayscale" />
             <p className="text-gray-800 font-bold mb-1">정말 떠나시나요?</p>
             <p className="text-sm text-gray-500">
               탈퇴 시 모든 이용 내역이 삭제되며,<br/>삭제된 데이터는 복구할 수 없습니다.
             </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowWithdrawModal(false)}
              className="flex-1 py-3 text-gray-500 bg-gray-100 rounded-lg font-medium"
            >
              더 써볼래요
            </button>
            <button 
              onClick={handleWithdraw}
              className="flex-1 py-3 text-white bg-red-500 rounded-lg font-medium"
            >
              탈퇴하기
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyPageView;
