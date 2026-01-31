import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import memberApi from '@/shared/api/meeting/memberApi';

/**
 * 멤버 목록 조회 훅
 * - 모임의 모든 멤버 조회 (APPROVED 상태 기준)
 * - 캐시: 3분
 */
export const useMembers = (groupId: string) => {
  return useQuery({
    queryKey: ['members', groupId],
    queryFn: async () => {
      const response = await memberApi.getMembers(groupId);
      return response || [];
    },
    enabled: !!groupId,
    staleTime: 1000 * 60 * 3, // 3분
    gcTime: 1000 * 60 * 10, // 10분 (이전 cacheTime)
    retry: 2, // 실패 시 2회 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // 지수 백오프
  });
};

/**
 * 대기 중인 멤버 목록 조회 훅
 * - 가입 신청 중인 멤버 조회 (PENDING 상태)
 * - 모임장만 조회 가능
 */
export const usePendingMembers = (groupId: string) => {
  return useQuery({
    queryKey: ['members', groupId, 'pending'],
    queryFn: async () => {
      const response = await memberApi.getPendingMembers(groupId);
      return response || [];
    },
    enabled: !!groupId,
    staleTime: 1000 * 60 * 3, // 3분
    gcTime: 1000 * 60 * 10, // 10분
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

/**
 * 멤버 승인 훅
 */
export const useApproveMember = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, responseMessage }: { memberId: string; responseMessage?: string }) => {
      await memberApi.approveMember(groupId, { memberId, responseMessage });
      return memberId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['members', groupId, 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['meetings', 'detail', groupId] });
    },
    onError: (error) => {
      console.error('멤버 승인 실패:', error);
    },
  });
};

/**
 * 멤버 거절 훅
 */
export const useRejectMember = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, responseMessage }: { memberId: string; responseMessage?: string }) => {
      await memberApi.rejectMember(groupId, { memberId, responseMessage: responseMessage || '' });
      return memberId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', groupId, 'pending'] });
    },
    onError: (error) => {
      console.error('멤버 거절 실패:', error);
    },
  });
};

/**
 * 멤버 강퇴 훅
 */
export const useRemoveMember = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      await memberApi.removeMember(groupId, memberId);
      return memberId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['meetings', 'detail', groupId] });
    },
    onError: (error) => {
      console.error('멤버 강퇴 실패:', error);
    },
  });
};

/**
 * 방장 권한 위임
 */
export const useTransferHost = (groupId: string) => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newHostId: string) => {
      await memberApi.transferHost(groupId, { newHostUserId: newHostId });
      return newHostId;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: meetingKeys.detail(groupId) });
    },
  });
};
