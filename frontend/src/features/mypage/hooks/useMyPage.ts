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
  // MyPage Store는 사용하지 않음 (authStore에서 직접 가져옴)
  const toggleLikeByGroupId = useMeetingStore((state) => state.toggleLikeByGroupId);
  const meetings = useMeetingStore((state) => state.meetings);
  const authUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | number | null>(null);

  // 사용자 변경 시 React Query 캐시 무효화
  useEffect(() => {
    const currentUserId = authUser?.userId ?? null;
    if (prevUserIdRef.current !== currentUserId && currentUserId !== null) {
      prevUserIdRef.current = currentUserId;
      // 이전 캐시 완전 제거
      queryClient.removeQueries({ queryKey: myPageKeys.profile() });
      queryClient.removeQueries({ queryKey: myPageKeys.myMeetings() });
      queryClient.removeQueries({ queryKey: myPageKeys.likedMeetings() });
    }
  }, [authUser?.userId, queryClient]);

  // 내 모임 (API)
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

  // 찜한 모임 (API)
  const { data: likedMeetingsData, error: likedMeetingsError, refetch: refetchLikedMeetings } = useQuery({
    queryKey: myPageKeys.likedMeetings(),
    queryFn: async () => {
      const response = await meetingApi.getLiked();
      return transformMeetingsToUI(response.data || []);
    },
    staleTime: 0,
    retry: 1,
    enabled: !!authUser,
  });

  // 파생 데이터
  const myMeetings = useMemo(() => {
    if (myMeetingsData && !myMeetingsError) return myMeetingsData;
    return meetings.filter((m) => m.myStatus === 'APPROVED');
  }, [meetings, myMeetingsData, myMeetingsError]);

  const likedMeetings = useMemo(() => {
    if (likedMeetingsData && !likedMeetingsError) return likedMeetingsData;
    return meetings.filter((m) => m.isLiked);
  }, [meetings, likedMeetingsData, likedMeetingsError]);

  const isLoading = false; // authUser가 있으면 isLoading은 false

  return {
    myMeetings,
    likedMeetings,
    isLoading,
    unlikeMeeting: toggleLikeByGroupId,
    refetchLikedMeetings,
  };
};
