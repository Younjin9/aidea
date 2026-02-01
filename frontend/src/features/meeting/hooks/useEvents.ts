import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import eventApi from '@/shared/api/event/eventApi';
import type { CreateEventRequest, UpdateEventRequest } from '@/shared/types/Event.types';

/**
 * 정모 생성 훅
 */
export const useCreateEvent = (groupId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: CreateEventRequest) => {
      const response = await eventApi.createEvent(groupId, data);
      return response.data;
    },
    onSuccess: (data) => {
      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['meetings', 'detail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['events', groupId] });

      // 상세 페이지로 이동 (새 이벤트 정보와 함께)
      navigate(`/meetings/${groupId}`, { state: { newEvent: data } });
    },
    onError: (error) => {
      console.warn('정모 생성 API 실패 (fallback 처리됨):', error);
    },
  });
};

/**
 * 정모 수정 훅
 */
export const useUpdateEvent = (groupId: string, eventId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: UpdateEventRequest) => {
      const response = await eventApi.updateEvent(groupId, eventId, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'detail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['events', groupId] });

      navigate(`/meetings/${groupId}`, { state: { updatedEvent: data } });
    },
    onError: (error) => {
      console.warn('정모 수정 API 실패 (fallback 처리됨):', error);
    },
  });
};

/**
 * 정모 삭제 훅
 */
export const useDeleteEvent = (groupId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (eventId: string) => {
      await eventApi.cancelEvent(groupId, eventId);
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'detail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['events', groupId] });

      navigate(`/meetings/${groupId}`, { state: { deletedEventId: eventId } });
    },
    onError: (error) => {
      console.warn('정모 삭제 API 실패 (fallback 처리됨):', error);
    },
  });
};

/**
 * 정모 참석 훅
 */
export const useJoinEvent = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await eventApi.participateEvent(groupId, eventId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'detail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['events', groupId] });
    },
    onError: (error: any) => {
      console.warn('정모 참석 API 실패:', error);
      const message = error?.response?.data?.message || '';

      // 이미 참석 중인 경우 (500 에러 내부 메시지 또는 400 에러)
      if (message.includes('이미 참석') || message.includes('Already')) {
        alert('이미 참석 중인 정모입니다. 정보를 갱신합니다.');
        queryClient.invalidateQueries({ queryKey: ['meeting', 'detail', groupId] });
        queryClient.invalidateQueries({ queryKey: ['events', groupId] });
      } else {
        alert(message || '정모 참석에 실패했습니다.');
      }
    },
  });
};

/**
 * 정모 참석 취소 훅
 */
export const useCancelEventParticipation = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      await eventApi.cancelParticipation(groupId, eventId);
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'detail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['events', groupId] });
    },
    onError: (error: any) => {
      console.warn('정모 참석 취소 API 실패:', error);
      alert(error?.response?.data?.message || '정모 참석 취소에 실패했습니다.');
    },
  });
};
