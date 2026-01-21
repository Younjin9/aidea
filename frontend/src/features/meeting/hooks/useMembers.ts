import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import memberApi from '@/shared/api/meeting/memberApi';

/**
 * 멤버 목록 조회 훅
 */
export const useMembers = (groupId: string) => {
  return useQuery({
    queryKey: ['members', groupId],
    queryFn: async () => {
      const response = await memberApi.getMembers(groupId);
      return response.data;
    },
    staleTime: 1000 * 60 * 3,
  });
};

/**
 * 대기 중인 멤버 목록 조회 훅
 */
export const usePendingMembers = (groupId: string) => {
  return useQuery({
    queryKey: ['members', groupId, 'pending'],
    queryFn: async () => {
      const response = await memberApi.getPendingMembers(groupId);
      return response.data;
    },
    staleTime: 1000 * 60 * 3,
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
      queryClient.invalidateQueries({ queryKey: ['meeting', 'detail', groupId] });
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
      await memberApi.rejectMember(groupId, { memberId, responseMessage });
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
      queryClient.invalidateQueries({ queryKey: ['meeting', 'detail', groupId] });
    },
    onError: (error) => {
      console.error('멤버 강퇴 실패:', error);
    },
  });
};

/**
 * 모임장 양도 훅
 */
export const useTransferHost = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newHostId: string) => {
      await memberApi.transferHost(groupId, { newHostId });
      return newHostId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['meeting', 'detail', groupId] });
    },
    onError: (error) => {
      console.error('모임장 양도 실패:', error);
    },
  });
};
