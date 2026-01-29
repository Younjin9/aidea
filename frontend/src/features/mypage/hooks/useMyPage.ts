import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import mypageApi from '@/shared/api/user/userApi';
import meetingApi from '@/shared/api/meeting/meetingApi';
import { useMeetingStore } from '@/features/meeting/store/meetingStore';
import { transformMeetingsToUI } from '@/features/meeting/hooks/useMeetings';
import { useAuthStore } from '@/features/auth/store/authStore';

// ============================================
// React Query Keys
// ============================================

export const myPageKeys = {
  all: ['mypage'] as const,
  myMeetings: () => [...myPageKeys.all, 'my-meetings'] as const,
  likedMeetings: () => [...myPageKeys.all, 'liked-meetings'] as const,
};

// ============================================
// Custom Hook
// ============================================

export const useMyPage = () => {
  const authUser = useAuthStore((state) => state.user);
  const meetings = useMeetingStore((state) => state.meetings);
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | number | null>(null);

  // 사용자 변경 시 React Query 캐시 무효화
  useEffect(() => {
    const currentUserId = authUser?.userId ?? null;
    if (prevUserIdRef.current !== currentUserId && currentUserId !== null) {
      prevUserIdRef.current = currentUserId;
      // 이전 캐시 완전 제거
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
      const meetings = transformMeetingsToUI(response.data || []);
      // 찜 목록은 모두 isLiked = true로 설정
      return meetings.map(meeting => ({ ...meeting, isLiked: true }));
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

  return {
    myMeetings,
    likedMeetings,
    isLoading: false,
    refetchLikedMeetings,
  };
};
