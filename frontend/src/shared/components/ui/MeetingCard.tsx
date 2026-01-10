import React from 'react';
import type { MeetingCardProps } from '@/shared/types/component.types';
import { MapPin, Users, Calendar, Heart } from 'lucide-react';

const statusStyles = {
  RECRUITING: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: '모집중',
  },
  CONFIRMED: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    label: '확정',
  },
  COMPLETED: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: '완료',
  },
  CANCELLED: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: '취소',
  },
};

const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  variant = 'card',
  onClick,
  onLike,
  isLiked = false,
  className = '',
}) => {
  const {
    meeting_id,
    title,
    description,
    image_url,
    location,
    max_members,
    current_members,
    meeting_date,
    status,
    tags = [],
  } = meeting;

  const statusStyle = statusStyles[status];

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month}/${day} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleCardClick = () => {
    onClick?.(meeting_id);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(meeting_id);
  };

  // Card 변형 (기본)
  if (variant === 'card') {
    return (
      <div
        className={`
          relative
          flex gap-4
          bg-amber-50
          rounded-xl
          shadow-sm
          hover:shadow-md
          transition-all
          duration-300
          overflow-hidden
          cursor-pointer
          border border-amber-100
          p-4
          ${className}
        `}
        onClick={handleCardClick}
      >
        {/* 이미지 영역 */}
        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
              {title}
            </h3>
            <p className="text-xs text-gray-600 mb-2 line-clamp-1">
              {description || `${location} · 멤버 ${current_members}/${max_members}`}
            </p>
          </div>
          
          {/* 메타 정보 */}
          <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
            <span>{location}</span>
            <span>·</span>
            <span>멤버 {current_members}</span>
          </div>

          {/* 태그 */}
          {tags.length > 0 && (
            <div className="text-xs text-gray-400 mt-1 line-clamp-1">
              #{tags.join(' #')}
            </div>
          )}
        </div>

        {/* 좋아요 버튼 */}
        <button
          onClick={handleLikeClick}
          className="
            flex-shrink-0
            self-end
            w-6 h-6
            flex items-center justify-center
            transition-colors
            p-1
          "
        >
          <Heart
            size={20}
            className={`${isLiked ? 'fill-primary text-primary' : 'text-gray-300'}`}
          />
        </button>
      </div>
    );
  }

 

  // Compact 변형 (최소 정보)
  return (
    <div
      className={`
        bg-white
        rounded-lg
        p-4
        border border-gray-200
        hover:border-blue-300
        transition-colors
        cursor-pointer
        ${className}
      `}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 flex-1">
          {title}
        </h3>
        <span
          className={`
            px-2 py-0.5
            rounded-full
            text-xs font-semibold
            ml-2
            ${statusStyle.bg} ${statusStyle.text}
          `}
        >
          {statusStyle.label}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(meeting_date)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>
            {current_members}/{max_members}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;