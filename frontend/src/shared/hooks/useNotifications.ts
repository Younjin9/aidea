import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationApi from '@/shared/api/notificationApi';

/**
 * 알림 목록 조회 훅
 * - 30초마다 자동 갱신 (폴링)
 */
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
    staleTime: 1000 * 30, // 30초
    refetchInterval: 1000 * 30, // 30초마다 자동 갱신
    retry: 2,
  });
};

/**
 * 안읽은 알림 개수 조회 훅
 */
export const useUnreadCount = () => {
  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationApi.getUnreadCount,
    staleTime: 1000 * 30, // 30초
    refetchInterval: 1000 * 30, // 30초마다 자동 갱신
  });

  return data ?? 0;
};

/**
 * 알림 읽음 처리 훅
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      // 알림 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('알림 읽음 처리 실패:', error);
    },
  });
};

/**
 * 모든 알림 읽음 처리 훅
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: number[]) => notificationApi.markAllAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('전체 읽음 처리 실패:', error);
    },
  });
};
