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
    groupId: meeting.groupId, // 원본 groupId 유지
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
 * 통합 훅 - Mock 데이터 사용 (테스트용)
 * TODO: 테스트 완료 후 API 호출 방식으로 전환
 */
export const useMeetings = (_params: MeetingListParams = {}) => {
  const meetings = useMeetingStore((state) => state.meetings);
  const groupByCategoryFn = useMeetingStore((state) => state.groupByCategory);
  const toggleLikeByGroupId = useMeetingStore((state) => state.toggleLikeByGroupId);
  const initializeMockData = useMeetingStore((state) => state.initializeMockData);
  const isInitialized = useMeetingStore((state) => state.isInitialized);

  // Mock 데이터 초기화
  if (!isInitialized) {
    initializeMockData();
  }

  return {
    meetings,
    total: meetings.length,
    isLoading: false,
    error: null,

    groupByCategory: groupByCategoryFn,

    // Store의 toggleLikeByGroupId 사용
    toggleLike: (groupId: string, _isLiked: boolean) => {
      toggleLikeByGroupId(groupId);
    },
    isTogglingLike: false,

    refetch: () => Promise.resolve(),
  };
};