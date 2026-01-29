import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import meetingApi from '@/shared/api/meeting/meetingApi';
import { useMeetingStore } from '../store/meetingStore';
import { myPageKeys } from '@/features/mypage/hooks/useMyPage';
import type { Meeting, MeetingUI, MeetingListParams, CreateMeetingRequest, UpdateMeetingRequest } from '@/shared/types/Meeting.types';

// ============================================
// Helper Functions
// ============================================

/**
 * Meeting 타입을 MeetingUI 타입으로 변환
 */
const transformMeetingToUI = (meeting: Meeting): MeetingUI => {
  return {
    id: meeting.groupId,
    groupId: meeting.groupId.toString(),
    image: meeting.imageUrl || '',
    title: meeting.title,
    category: meeting.interestCategoryName || '카테고리',
    location: meeting.region || meeting.location || '위치 정보',
    members: meeting.memberCount,
    maxMembers: meeting.maxMembers,
    description: meeting.description,
    isLiked: false,
    ownerUserId: meeting.ownerUserId, // still keep this but relying on myRole is better
    myStatus: meeting.myStatus as 'PENDING' | 'APPROVED' | undefined,
    myRole: meeting.myRole as 'HOST' | 'MEMBER' | undefined,
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
  list: () => [...meetingKeys.all, 'list'] as const,
  detail: (groupId: string) => [...meetingKeys.all, 'detail', groupId] as const,
};

// ============================================
// Custom Hooks
// ============================================

/**
 * 모임 목록 조회 - API 호출 후 실패 시 Mock 데이터 fallback
 */
export const useMeetings = (params: MeetingListParams = {}) => {
  const meetings = useMeetingStore((state) => state.meetings);
  const setMeetings = useMeetingStore((state) => state.setMeetings);
  const groupByCategoryFn = useMeetingStore((state) => state.groupByCategory);
  const toggleLikeByGroupId = useMeetingStore((state) => state.toggleLikeByGroupId);

  // API 호출
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: meetingKeys.list(),
    queryFn: async () => {
      const response = await meetingApi.getList(params);
      const content = response.data?.content || [];
      return transformMeetingsToUI(content);
    },
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });

  // API 성공 시 store 업데이트
  useEffect(() => {
    if (data) {
      console.log('[useMeetings] Setting meetings from API:', data);
      setMeetings(data);
    } else if (error) {
      console.warn('모임 목록 API 호출 실패:', error);
    }
  }, [data, error, setMeetings]);

  // Like/Unlike API 호출 (useToggleLikeMeeting 활용)
  const { mutate: toggleLikeApi } = useToggleLikeMeeting();

  const toggleLikeMeeting = (groupId: string | number, isCurrentlyLiked: boolean) => {
    console.log(`[useMeetings] Toggle like for ${groupId}, currently liked: ${isCurrentlyLiked}`);
    // 로컬 스토어 먼저 업데이트 (낙관적 업데이트)
    toggleLikeByGroupId(String(groupId));
    // API 호출
    toggleLikeApi(
      { groupId: String(groupId), isLiked: isCurrentlyLiked },
      {
        onSuccess: () => {
          console.log(`[useMeetings] Like toggle success for ${groupId}, refetching meetings`);
          // API 성공 후 모임 목록 재조회 (isLiked 값 동기화)
          refetch();
        },
        onError: (error) => {
          console.error(`[useMeetings] Like toggle failed for ${groupId}:`, error);
          // 실패 시 롤백
          toggleLikeByGroupId(String(groupId));
        },
      }
    );
  };

  return {
    meetings,
    total: meetings.length,
    isLoading,
    error,
    groupByCategory: groupByCategoryFn,
    toggleLikeMeeting,
    refetch,
  };
};

// ============================================
// Like / Unlike (서버 반영)
// ============================================

export const useToggleLikeMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, isLiked }: { groupId: string; isLiked: boolean }) => {
      console.log(`[Like] Toggling like for group ${groupId}, isLiked: ${isLiked}`);
      try {
        if (isLiked) {
          console.log(`[Like] Calling unlike API for group ${groupId}`);
          await meetingApi.unlike(groupId);
        } else {
          console.log(`[Like] Calling like API for group ${groupId}`);
          await meetingApi.like(groupId);
        }
        console.log(`[Like] Success for group ${groupId}`);
        return { groupId };
      } catch (error) {
        console.error(`[Like] Error toggling like for group ${groupId}:`, error);
        throw error;
      }
    },
    onSuccess: (_, { groupId }) => {
      console.log(`[Like] onSuccess - Invalidating caches for group ${groupId}`);
      // 모든 관련 캐시 무효화 (모임 목록, 상세, 찜 목록, 멤버)
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      queryClient.invalidateQueries({ queryKey: ['meetings', 'search'] });
      queryClient.invalidateQueries({ queryKey: ['meeting', 'detail'] });
      queryClient.invalidateQueries({ queryKey: myPageKeys.myMeetings() });
      queryClient.invalidateQueries({ queryKey: myPageKeys.likedMeetings() });
      queryClient.invalidateQueries({ queryKey: ['members', groupId] });
      console.log(`[Like] All caches invalidated for group ${groupId}`);
    },
    onError: (error, { groupId, isLiked }) => {
      console.error(`[Like] Error for group ${groupId} (isLiked: ${isLiked}):`, error);
    },
  });
};

// ============================================
// Meeting Actions (생성/참여/탈퇴)
// ============================================

/**
 * 모임 생성
 */
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const addMeeting = useMeetingStore((state) => state.addMeeting);

  return useMutation({
    mutationFn: async (data: CreateMeetingRequest) => {
      const response = await meetingApi.create(data);
      return response.data;
    },
    onSuccess: (data) => {
      if (!data) {
        console.error('모임 생성 성공했으나 데이터가 없습니다.');
        return;
      }

      addMeeting({
        groupId: data.groupId?.toString() || '',
        image: data.imageUrl || '',
        title: data.title || '',
        category: data.interestCategoryName || '카테고리',
        location: data.region || '위치 정보 없음',
        members: data.currentMembers || 1,
        maxMembers: data.maxMembers || 0,
        description: data.description || '',
        date: data.createdAt || new Date().toISOString(),
        isLiked: false,
        ownerUserId: data.creator?.userId || 0,
        myStatus: 'APPROVED',
        myRole: 'HOST',
      });

      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      queryClient.invalidateQueries({ queryKey: myPageKeys.myMeetings() });
      navigate('/meetings');
    },
    onError: (error: any) => {
      console.warn('모임 생성 API 실패 (fallback 처리됨):', error);
      if (error?.details) {
        console.error('Validation Details:', JSON.stringify(error.details, null, 2));
      }
    },
  });
};

/**
 * 모임 참여
 */
export const useJoinMeeting = () => {
  const queryClient = useQueryClient();
  const joinMeeting = useMeetingStore((state) => state.joinMeeting);

  return useMutation({
    mutationFn: async ({ groupId, requestMessage }: { groupId: string; requestMessage?: string }) => {
      const response = await meetingApi.join(groupId, { requestMessage });
      return { groupId, ...response.data };
    },
    onSuccess: (_, { groupId }) => {
      joinMeeting(groupId, 'MEMBER');
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: myPageKeys.myMeetings() });
    },
    onError: (error) => {
      console.warn('모임 참여 API 실패 (fallback 처리됨):', error);
    },
  });
};

/**
 * 모임 탈퇴
 */
export const useLeaveMeeting = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const leaveMeeting = useMeetingStore((state) => state.leaveMeeting);

  return useMutation({
    mutationFn: async (groupId: string) => {
      await meetingApi.leave(groupId);
      return groupId;
    },
    onSuccess: (groupId) => {
      leaveMeeting(groupId);
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      queryClient.invalidateQueries({ queryKey: myPageKeys.myMeetings() });
      navigate('/meetings');
    },
    onError: (error) => {
      console.warn('모임 탈퇴 API 실패 (fallback 처리됨):', error);
    },
  });
};

/**
 * 모임 정보 수정
 */
export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, data }: { groupId: string; data: UpdateMeetingRequest }) => {
      const response = await meetingApi.update(groupId, data);
      return response.data;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      queryClient.invalidateQueries({ queryKey: myPageKeys.myMeetings() });
    },
    onError: (error) => {
      console.warn('모임 수정 API 실패 (fallback 처리됨):', error);
    },
  });
};

/**
 * 모임 이미지 수정 (API 준비 중)
 */
export const useUpdateMeetingImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_params: { groupId: string; image: File }) => {
      // TODO: API가 준비되면 활성화
      // const response = await meetingApi.updateImage(groupId, image);
      // return { groupId, imageUrl: response.data.imageUrl };
      throw new Error('API not implemented yet');
    },
    onSuccess: ({ groupId }) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      queryClient.invalidateQueries({ queryKey: myPageKeys.myMeetings() });
    },
    onError: (error) => {
      console.warn('모임 이미지 수정 API 실패 (fallback 처리됨):', error);
    },
  });
};
