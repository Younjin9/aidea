import apiClient from './client';
import type { Notification, NotificationListResponse } from '@/shared/types/Notification.types';

/**
 * 알림 목록 조회
 * GET /api/notifications
 */
export const getNotifications = async (): Promise<NotificationListResponse> => {
  const response = await apiClient.get('/api/notifications');

  // 응답 형식 정규화
  if (response && typeof response === 'object') {
    // 배열이 직접 오는 경우
    if (Array.isArray(response)) {
      const notifications = response as Notification[];
      return {
        notifications,
        totalCount: notifications.length,
        unreadCount: notifications.filter(n => !n.isRead).length,
      };
    }

    // { data: [...] } 형식
    if ('data' in response && Array.isArray(response.data)) {
      const notifications = response.data as Notification[];
      return {
        notifications,
        totalCount: notifications.length,
        unreadCount: notifications.filter(n => !n.isRead).length,
      };
    }

    // { data: { notifications: [...] } } 형식 (현재 백엔드 형식)
    if ('data' in response && response.data && typeof response.data === 'object' && 'notifications' in response.data) {
      const data = response.data as NotificationListResponse;
      return {
        ...data,
        unreadCount: data.unreadCount ?? data.notifications.filter(n => !n.isRead).length,
      };
    }

    // 완전한 NotificationListResponse 형식 (fallback)
    if ('notifications' in response) {
      const result = response as NotificationListResponse;
      return {
        ...result,
        unreadCount: result.unreadCount ?? result.notifications.filter(n => !n.isRead).length,
      };
    }
  }

  // fallback
  return { notifications: [], totalCount: 0, unreadCount: 0 };
};

/**
 * 안 읽은 알림 개수 조회
 * GET /api/notifications/unread/count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get('/api/notifications/unread/count');

  if (response && typeof response === 'object') {
    if ('data' in response && typeof response.data === 'object' && response.data && 'unreadCount' in response.data) {
      return (response.data as { unreadCount: number }).unreadCount;
    }
  }

  return 0;
};

/**
 * 알림 읽음 처리
 * PATCH /api/notifications/{id}/read
 */
export const markAsRead = async (notificationId: number): Promise<void> => {
  await apiClient.patch(`/api/notifications/${notificationId}/read`);
};

/**
 * 모든 알림 읽음 처리 (일괄)
 */
export const markAllAsRead = async (notificationIds: number[]): Promise<void> => {
  await Promise.all(notificationIds.map(id => markAsRead(id)));
};

const notificationApi = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};

export default notificationApi;
