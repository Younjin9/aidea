import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnreadCount } from '@/shared/hooks/useNotifications';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();

  return (
    <button
      onClick={() => navigate('/notifications')}
      className={`relative ${className}`}
      aria-label="알림"
    >
      <Bell size={20} className="text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
