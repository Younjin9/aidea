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
    members: meeting.memberCount || meeting.currentMembers || 0,
    maxMembers: meeting.maxMembers,
    description: meeting.description?.trim() || undefined, // 빈 문자열이면 undefined로 변환
    isLiked: meeting.isLiked ?? false, // ← API 응답의 isLiked 필드 사용
    ownerUserId: meeting.ownerUserId,
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

  // API 기반 좋아요 토글
  const { mutate: toggleLikeMeetingMutation } = useToggleLikeMeeting();

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

  // API 성공 시 store 업데이트 (Mock 데이터 사용 안 함)
  useEffect(() => {
    if (data) {
      setMeetings(data);
    }
  }, [data, setMeetings]);

  // toggleLikeMeeting wrapper - groupId만 전달
  const toggleLikeMeeting = (groupId: string) => {
    toggleLikeMeetingMutation({ groupId });
  };

  return {
    meetings,
    total: meetings.length,
    isLoading,
    error,
    groupByCategory: groupByCategoryFn,
    toggleLike: toggleLikeByGroupId,
    toggleLikeMeeting,
    refetch,
  };
};

// ============================================
// Like / Unlike (서버 반영)
// ============================================

export const useToggleLikeMeeting = () => {
  const queryClient = useQueryClient();
  const toggleLikeByGroupId = useMeetingStore((state) => state.toggleLikeByGroupId);

  return useMutation({
    mutationFn: async ({ groupId }: { groupId: string }) => {
      // API 호출: 토글 방식이므로 isLiked 상태 확인 불필요
      await meetingApi.toggleLike(groupId);
      return { groupId };
    },
    onMutate: async ({ groupId }) => {
      // Optimistic update: 즉시 UI 업데이트
      toggleLikeByGroupId(groupId);
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: myPageKeys.myMeetings() });
      queryClient.invalidateQueries({ queryKey: myPageKeys.likedMeetings() });
      queryClient.invalidateQueries({ queryKey: ['members', groupId] });
    },
    onError: (_, { groupId }) => {
      // API 실패 시 되돌리기
      toggleLikeByGroupId(groupId);
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

  return useMutation({
    mutationFn: async ({ groupId, requestMessage }: { groupId: string; requestMessage?: string }) => {
      const response = await meetingApi.join(groupId, { requestMessage });
      return { groupId, data: response.data };
    },
    onSuccess: ({ groupId, data }) => {
      // API 응답에서 실제 status 확인 (PENDING | APPROVED)
      console.log('모임 참여 성공:', data);

      // React Query 캐시 무효화 (API 재호출하여 최신 myRole, myStatus 반영)
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.list() });
      queryClient.invalidateQueries({ queryKey: myPageKeys.myMeetings() });
    },
    onError: (error) => {
      console.error('모임 참여 API 실패:', error);
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
    mutationFn: async ({ groupId, shouldNavigate = true }: { groupId: string; shouldNavigate?: boolean }) => {
      await meetingApi.leave(groupId);
      return { groupId, shouldNavigate };
    },
    onSuccess: ({ groupId, shouldNavigate }) => {
      leaveMeeting(groupId);
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      queryClient.invalidateQueries({ queryKey: myPageKeys.myMeetings() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(groupId) }); // 상세 정보 갱신

      if (shouldNavigate) {
        navigate('/meetings');
      }
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
