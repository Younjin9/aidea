import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { MeetingUI } from '@/shared/types/Meeting.types';
import defaultLogo from '@/assets/images/logo.png';

interface MeetingCardProps {
  meeting: MeetingUI;
  onClick?: () => void;
  onLike?: () => void;
  showLikeButton?: boolean;
}

const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onClick,
  onLike,
  showLikeButton = true,
}) => {
  const navigate = useNavigate();

  // D-day 계산 함수
  const calculateDDay = (dateString?: string): string | null => {
    if (!dateString) return null;
    
    try {
      const targetDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);
      
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return null; // 지난 날짜는 표시 안 함
      if (diffDays === 0) return 'D-day';
      return `D-${diffDays}`;
    } catch {
      return null;
    }
  };

  const dDay = calculateDDay(meeting.date);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/meetings/${meeting.groupId}`);
    }
  };

  return (
    <div className="relative flex gap-3 cursor-pointer pr-12" onClick={handleClick}>
      {/* 이미지 */}
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        {meeting.image ? (
          meeting.image === defaultLogo ? (
            <img src={meeting.image} alt={meeting.title} className="w-7 h-7 object-contain" />
          ) : (
            <img src={meeting.image} alt={meeting.title} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="text-xs text-gray-400">사진</div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 flex flex-col h-20">
        {/* 제목 - D-day 태그 */}
        <div className="mb-2 flex items-center gap-2">
          {dDay && (
            <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full whitespace-nowrap">
              {dDay}
            </span>
          )}
          <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{meeting.title}</h3>
        </div>

        {/* 한줄소개 & 위치·멤버 */}
        <div>
          <p className="text-xs text-gray-500 mb-0.5 line-clamp-1">{meeting.category}</p>
          <p className="text-xs text-gray-400">{meeting.location} · 멤버 {meeting.members}</p>
        </div>
      </div>

      {/* 좋아요 버튼 (우측 하단에 고정 배치) */}
      {showLikeButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
          className="absolute right-3 bottom-2 p-2 rounded-full bg-white shadow-sm"
          aria-label="like"
        >
          <Heart
            size={20}
            className={`transition-colors ${meeting.isLiked ? 'fill-primary text-primary' : 'text-gray-300'}`}
          />
        </button>
      )}
    </div>
  );
};

export default MeetingCard;