import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import mypageApi from '@/shared/api/user/userApi';
import meetingApi from '@/shared/api/meeting/meetingApi';
import { useMyPageStore } from '../store/myPageStore';
import { useMeetingStore } from '@/features/meeting/store/meetingStore';
import { transformMeetingsToUI } from '@/features/meeting/hooks/useMeetings';
import { useAuthStore } from '@/features/auth/store/authStore';

// ============================================
// React Query Keys
// ============================================

export const myPageKeys = {
  all: ['mypage'] as const,
  profile: () => [...myPageKeys.all, 'profile'] as const,
  myMeetings: () => [...myPageKeys.all, 'my-meetings'] as const,
  likedMeetings: () => [...myPageKeys.all, 'liked-meetings'] as const,
};

// ============================================
// Custom Hook
// ============================================

/**
 * 마이페이지 통합 훅 - API 호출 후 실패 시 Mock 데이터 fallback
 */
export const useMyPage = () => {
  // MyPage Store (user 정보만)
  const user = useMyPageStore((state) => state.user);
  const setUser = useMyPageStore((state) => state.setUser);
  const updateUser = useMyPageStore((state) => state.updateUser);
  const clearUser = useMyPageStore((state) => state.clearUser);

  // Auth Store (현재 로그인 사용자)
  const authUser = useAuthStore((state) => state.user);

  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | number | null>(null);

  // Meeting Store (모임 정보)
  const meetings = useMeetingStore((state) => state.meetings);
  const toggleLikeByGroupId = useMeetingStore((state) => state.toggleLikeByGroupId);

  // 로그인 사용자 변경 시 캐시/스토어 정리
  useEffect(() => {
    const currentUserId = authUser?.userId ?? null;
    if (prevUserIdRef.current !== currentUserId) {
      prevUserIdRef.current = currentUserId;
      clearUser();
      queryClient.removeQueries({ queryKey: myPageKeys.profile() });
      queryClient.removeQueries({ queryKey: myPageKeys.myMeetings() });
      queryClient.removeQueries({ queryKey: myPageKeys.likedMeetings() });
    }
  }, [authUser?.userId, clearUser, queryClient]);

  // 프로필 API 호출
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: myPageKeys.profile(),
    queryFn: async () => {
      const response = await mypageApi.getMyProfile();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!authUser,
  });

  // API 성공 시 store 업데이트
  useEffect(() => {
    if (profileData) {
      setUser(profileData);
    }
  }, [profileData, setUser]);

  // 내 모임 (API) - 실패 시 store fallback
  const { data: myMeetingsData, error: myMeetingsError } = useQuery({
    queryKey: myPageKeys.myMeetings(),
    queryFn: async () => {
      const response = await mypageApi.getMyMeetings('active');
      return transformMeetingsToUI(response.data || []);
    },
    staleTime: 1000 * 60 * 3,
    retry: 1,
    enabled: !!authUser,
  });

  // 찜한 모임 (API) - meetingApi.getLiked, 실패 시 store fallback
  const { data: likedMeetingsData, error: likedMeetingsError, refetch: refetchLikedMeetings } = useQuery({
    queryKey: myPageKeys.likedMeetings(),
    queryFn: async () => {
      const response = await meetingApi.getLiked();
      return transformMeetingsToUI(response.data || []);
    },
    staleTime: 0, // 항상 최신 데이터 가져오기
    retry: 1,
    enabled: !!authUser,
  });

  // meetingStore에서 파생된 데이터 (useMemo로 참조 안정성 보장)
  const myMeetings = useMemo(() => {
    if (myMeetingsData && !myMeetingsError) return myMeetingsData;
    return meetings.filter((m) => m.myStatus === 'APPROVED');
  }, [meetings, myMeetingsData, myMeetingsError]);

  const likedMeetings = useMemo(() => {
    if (likedMeetingsData && !likedMeetingsError) return likedMeetingsData;
    return meetings.filter((m) => m.isLiked);
  }, [meetings, likedMeetingsData, likedMeetingsError]);

  return {
    // 사용자 정보
    user,
    isLoading: isLoadingProfile,
    error: profileError,

    // 내 모임
    myMeetings,

    // 찜한 모임
    likedMeetings,

    // Actions
    unlikeMeeting: toggleLikeByGroupId,
    updateUser,

    // Refetch
    refetchProfile,
    refetchLikedMeetings,
  };
};
