import apiClient from './client';
import type { Notification, NotificationListResponse } from '@/shared/types/Notification.types';

/**
 * 알림 목록 조회
 * GET /api/v1/notifications
 */
export const getNotifications = async (): Promise<NotificationListResponse> => {
  const response = await apiClient.get('/api/v1/notifications');
  
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
    
    // 완전한 NotificationListResponse 형식
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
 * 알림 읽음 처리
 * PATCH /api/v1/notifications/{id}/read
 */
export const markAsRead = async (notificationId: number): Promise<void> => {
  await apiClient.patch(`/api/v1/notifications/${notificationId}/read`);
};

/**
 * 모든 알림 읽음 처리 (일괄)
 */
export const markAllAsRead = async (notificationIds: number[]): Promise<void> => {
  await Promise.all(notificationIds.map(id => markAsRead(id)));
};

const notificationApi = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

export default notificationApi;
