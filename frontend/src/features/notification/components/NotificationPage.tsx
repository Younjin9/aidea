import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, UserPlus, CheckCircle, XCircle, Calendar, CalendarOff, UserMinus, Crown, MessageCircle } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import Loading from '@/shared/components/ui/Loading';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/shared/hooks/useNotifications';
import type { Notification, NotificationType } from '@/shared/types/Notification.types';

// 알림 타입별 아이콘 매핑
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'LIKE':
      return <Heart size={20} className="text-red-500" />;
    case 'JOIN_REQUEST':
      return <UserPlus size={20} className="text-blue-500" />;
    case 'JOIN_APPROVED':
      return <CheckCircle size={20} className="text-green-500" />;
    case 'JOIN_REJECTED':
      return <XCircle size={20} className="text-gray-500" />;
    case 'EVENT_JOIN':
      return <Calendar size={20} className="text-purple-500" />;
    case 'EVENT_CANCEL':
      return <CalendarOff size={20} className="text-orange-500" />;
    case 'MEMBER_LEFT':
      return <UserMinus size={20} className="text-gray-500" />;
    case 'HOST_TRANSFERRED':
      return <Crown size={20} className="text-yellow-500" />;
    case 'CHAT_MESSAGE':
      return <MessageCircle size={20} className="text-primary" />;
    default:
      return <MessageCircle size={20} className="text-gray-500" />;
  }
};

// 시간 포맷팅 (상대 시간)
const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
};

const NotificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const notifications = data?.notifications ?? [];
  const unreadNotifications = notifications.filter(n => !n.isRead);

  const handleNotificationClick = (notification: Notification) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // 관련 페이지로 이동
    if (notification.relatedGroupId) {
      // 채팅 알림은 채팅 탭으로 이동
      if (notification.type === 'CHAT_MESSAGE') {
        navigate(`/meetings/${notification.relatedGroupId}`, { state: { initialTab: 'chat' } });
      } else {
        navigate(`/meetings/${notification.relatedGroupId}`);
      }
    }
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = unreadNotifications.map(n => n.id);
    if (unreadIds.length > 0) {
      markAllAsRead(unreadIds);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loading message="알림을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="font-semibold text-lg">알림</h1>
          </div>
          {unreadNotifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-primary font-medium"
            >
              모두 읽음
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MessageCircle size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationPage;
