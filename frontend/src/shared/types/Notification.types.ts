// ============================================
// 🔔 Notification Types
// 알림 관리
// ============================================

export type NotificationType = 
  | 'LIKE'              // 좋아요
  | 'JOIN_REQUEST'      // 참가 신청
  | 'JOIN_APPROVED'     // 참가 승인
  | 'JOIN_REJECTED'     // 참가 거절
  | 'EVENT_JOIN'        // 정모 참가
  | 'EVENT_CANCEL'      // 정모 취소
  | 'MEMBER_LEFT'       // 멤버 탈퇴
  | 'HOST_TRANSFERRED'  // 모임장 양도
  | 'CHAT_MESSAGE';     // 채팅 메시지

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedGroupId?: number;
  relatedUserId?: number;
  relatedEventId?: number;
}

export interface NotificationListResponse {
  notifications: Notification[];
  totalCount?: number;
  unreadCount?: number;
}

export interface MarkAsReadRequest {
  notificationId: number;
}
