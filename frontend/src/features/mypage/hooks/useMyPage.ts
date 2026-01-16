import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import mypageApi from '@/shared/api/user/userApi';
import { useMyPageStore } from '../store/myPageStore';
import type { Meeting, MeetingUI } from '@/shared/types/Meeting.types';
import type { UpdateProfileRequest } from '@/shared/types/User.types';

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
    isLiked: false,
  };
};

export const transformMeetingsToUI = (meetings: Meeting[]): MeetingUI[] => {
  return meetings.map(transformMeetingToUI);
};

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
// Custom Hooks
// ============================================

/**
 * 내 프로필 조회
 */
export const useMyProfile = () => {
  const setUser = useMyPageStore((state) => state.setUser);

  return useQuery({
    queryKey: myPageKeys.profile(),
    queryFn: async () => {
      const response = await mypageApi.getMyProfile();
      const user = response.data;
      setUser(user);
      return user;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};

/**
 * 내가 참여 중인 모임 목록
 */
export const useMyMeetings = () => {
  const setMyMeetings = useMyPageStore((state) => state.setMyMeetings);

  return useQuery({
    queryKey: myPageKeys.myMeetings(),
    queryFn: async () => {
      const response = await mypageApi.getMyMeetings('active');
      const meetings = response.data;
      setMyMeetings(meetings);
      return meetings;
    },
    staleTime: 1000 * 60 * 3, // 3분
  });
};

/**
 * 내가 찜한 모임 목록
 */
export const useLikedMeetings = () => {
  const setLikedMeetings = useMyPageStore((state) => state.setLikedMeetings);

  return useQuery({
    queryKey: myPageKeys.likedMeetings(),
    queryFn: async () => {
      const response = await mypageApi.getLikedMeetings();
      const meetings = response.data;
      setLikedMeetings(meetings);
      return meetings;
    },
    staleTime: 1000 * 60 * 3, // 3분
  });
};

/**
 * 모임 찜하기 취소 (Optimistic Update)
 */
export const useUnlikeMeeting = () => {
  const queryClient = useQueryClient();
  const unlikeMeeting = useMyPageStore((state) => state.unlikeMeeting);

  return useMutation({
    mutationFn: async (groupId: string) => {
      // TODO: 실제 API 엔드포인트로 교체 필요
      // 현재는 meetingApi의 unlike 엔드포인트를 사용한다고 가정
      // await meetingApi.unlikeMeeting(groupId);
      return groupId;
    },
    onMutate: async (groupId: string) => {
      // 이전 쿼리 취소
      await queryClient.cancelQueries({ queryKey: myPageKeys.likedMeetings() });

      // 이전 데이터 스냅샷
      const previousMeetings = queryClient.getQueryData<Meeting[]>(myPageKeys.likedMeetings());

      // Optimistic Update
      queryClient.setQueryData<Meeting[]>(myPageKeys.likedMeetings(), (old: Meeting[] | undefined) => {
        return old?.filter((meeting: Meeting) => meeting.groupId !== groupId) ?? [];
      });

      // Zustand store도 업데이트
      unlikeMeeting(groupId);

      return { previousMeetings };
    },
    onError: (_err: unknown, _groupId: string, context: { previousMeetings?: Meeting[] } | undefined) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousMeetings) {
        queryClient.setQueryData(myPageKeys.likedMeetings(), context.previousMeetings);
      }
    },
    onSettled: () => {
      // 성공/실패 관계없이 쿼리 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({ queryKey: myPageKeys.likedMeetings() });
    },
  });
};

/**
 * 프로필 수정
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useMyPageStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => mypageApi.updateProfile(data),
    onSuccess: (response: { data: any }) => {
      const updatedUser = response.data;
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: myPageKeys.profile() });
    },
  });
};

/**
 * 통합 훅 - 모든 데이터를 한 번에 가져오기
 */
export const useMyPage = () => {
  const profile = useMyProfile();
  const myMeetings = useMyMeetings();
  const likedMeetings = useLikedMeetings();
  const unlikeMutation = useUnlikeMeeting();
  const updateProfileMutation = useUpdateProfile();

  const user = useMyPageStore((state) => state.user);
  const myMeetingsData = useMyPageStore((state) => state.myMeetings);
  const likedMeetingsData = useMyPageStore((state) => state.likedMeetings);

  return {
    // 사용자 정보
    user: user || profile.data,
    isLoadingProfile: profile.isLoading,
    profileError: profile.error,

    // 내 모임
    myMeetings: myMeetingsData.length > 0 ? myMeetingsData : myMeetings.data || [],
    isLoadingMyMeetings: myMeetings.isLoading,
    myMeetingsError: myMeetings.error,

    // 찜한 모임
    likedMeetings: likedMeetingsData.length > 0 ? likedMeetingsData : likedMeetings.data || [],
    isLoadingLikedMeetings: likedMeetings.isLoading,
    likedMeetingsError: likedMeetings.error,

    // 전체 로딩 상태
    isLoading: profile.isLoading || myMeetings.isLoading || likedMeetings.isLoading,
    error: profile.error || myMeetings.error || likedMeetings.error,

    // Mutations
    unlikeMeeting: unlikeMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    isUnliking: unlikeMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,

    // Refetch functions
    refetchProfile: profile.refetch,
    refetchMyMeetings: myMeetings.refetch,
    refetchLikedMeetings: likedMeetings.refetch,
  };
};