import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import meetingApi from '@/shared/api/meeting/meetingApi';
import { useMeetingStore } from '../store/meetingStore';
import type { Meeting, MeetingUI, MeetingListParams } from '@/shared/types/Meeting.types';

// ============================================
// Helper Functions
// ============================================

/**
 * Meeting 타입을 MeetingUI 타입으로 변환
 */
const transformMeetingToUI = (meeting: Meeting): MeetingUI => {
  return {
    id: parseInt(meeting.groupId, 10) || 0,
    image: meeting.imageUrl || '',
    title: meeting.title,
    category: meeting.interestCategoryName || '카테고리',
    location: `${meeting.location.region || '위치 정보 없음'}`,
    members: meeting.memberCount,
    isLiked: false, // 초기값은 false, 나중에 좋아요 목록과 비교하여 업데이트
  };
};

export const transformMeetingsToUI = (meetings: Meeting[]): MeetingUI[] => {
  return meetings.map(transformMeetingToUI);
};

// ============================================
// React Query Keys
// ============================================

export const meetingKeys = {
  all: ['meetings'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: (params: MeetingListParams) => [...meetingKeys.lists(), params] as const,
  nearby: () => [...meetingKeys.all, 'nearby'] as const,
  popular: () => [...meetingKeys.all, 'popular'] as const,
  liked: () => [...meetingKeys.all, 'liked'] as const,
};

// ============================================
// Custom Hooks
// ============================================

/**
 * 모임 목록 조회
 */
export const useMeetingList = (params: MeetingListParams = {}) => {
  const setMeetings = useMeetingStore((state) => state.setMeetings);

  return useQuery({
    queryKey: meetingKeys.list(params),
    queryFn: async () => {
      const response = await meetingApi.getList(params);
      const meetingsUI = transformMeetingsToUI(response.data.items);
      setMeetings(meetingsUI);
      return response.data;
    },
    staleTime: 1000 * 60 * 3, // 3분
  });
};

/**
 * 인기 모임 조회
 */
export const usePopularMeetings = () => {
  const setMeetings = useMeetingStore((state) => state.setMeetings);

  return useQuery({
    queryKey: meetingKeys.popular(),
    queryFn: async () => {
      const response = await meetingApi.getPopular();
      const meetingsUI = transformMeetingsToUI(response.data);
      setMeetings(meetingsUI);
      return meetingsUI;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};

/**
 * 모임 좋아요/취소 (Optimistic Update)
 */
export const useToggleLike = () => {
  const queryClient = useQueryClient();
  const toggleLike = useMeetingStore((state) => state.toggleLike);

  return useMutation({
    mutationFn: async ({ groupId, isLiked }: { groupId: string; isLiked: boolean }) => {
      if (isLiked) {
        await meetingApi.unlike(groupId);
      } else {
        await meetingApi.like(groupId);
      }
      return groupId;
    },
    onMutate: async ({ groupId, isLiked }) => {
      // 이전 쿼리 취소
      await queryClient.cancelQueries({ queryKey: meetingKeys.lists() });

      // Meeting ID를 찾아서 toggleLike 호출
      const meetings = useMeetingStore.getState().meetings;
      const meeting = meetings.find(m => m.id === parseInt(groupId, 10));
      if (meeting) {
        toggleLike(meeting.id);
      }

      return { groupId, isLiked };
    },
    onError: (_err, { groupId }) => {
      // 에러 발생 시 다시 토글 (롤백)
      const meetings = useMeetingStore.getState().meetings;
      const meeting = meetings.find(m => m.id === parseInt(groupId, 10));
      if (meeting) {
        toggleLike(meeting.id);
      }
    },
    onSettled: () => {
      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.liked() });
    },
  });
};

/**
 * 통합 훅 - 모든 데이터를 한 번에 가져오기
 */
export const useMeetings = (params: MeetingListParams = {}) => {
  const meetingList = useMeetingList(params);
  const toggleLikeMutation = useToggleLike();

  const meetings = useMeetingStore((state) => state.meetings);
  const groupByCategoryFn = useMeetingStore((state) => state.groupByCategory);

  return {
    // 모임 목록
    meetings: meetings.length > 0 ? meetings : transformMeetingsToUI(meetingList.data?.items || []),
    total: meetingList.data?.meta.total || 0,
    isLoading: meetingList.isLoading,
    error: meetingList.error,

    // 카테고리별 그룹핑 - 함수를 그대로 반환
    groupByCategory: groupByCategoryFn,

    // Mutations
    toggleLike: (groupId: string, isLiked: boolean) =>
      toggleLikeMutation.mutate({ groupId, isLiked }),
    isTogglingLike: toggleLikeMutation.isPending,

    // Refetch
    refetch: meetingList.refetch,
  };
};