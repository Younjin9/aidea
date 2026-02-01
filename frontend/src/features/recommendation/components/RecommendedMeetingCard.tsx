import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import { useMeetings } from '@/features/meeting/hooks/useMeetings';
import { INTEREST_CATEGORIES } from '@/shared/config/constants';
import defaultLogo from '@/assets/images/logo.png';
import type { MeetingUI } from '@/shared/types/Meeting.types';

interface RecommendedMeetingCardProps {
  meeting: MeetingUI;
}

// 카테고리에 따라 이모티콘 반환하는 함수
const getCategoryEmoji = (category: string): string => {
  // 정규화 함수: 공백 제거 및 소문자 변환
  const normalize = (str: string) => str.replace(/\s/g, '').toLowerCase();
  const normalizedCategory = normalize(category);
  
  // INTEREST_CATEGORIES에서 매칭 찾기
  for (const interestCategory of INTEREST_CATEGORIES) {
    // label과 매칭 (예: '운동 / 액티비티' vs '운동/스포츠')
    if (normalize(interestCategory.label).includes(normalizedCategory.split('/')[0]) ||
        normalizedCategory.includes(normalize(interestCategory.label).split('/')[0])) {
      return interestCategory.icon;
    }
    
    // items 배열에서 정확히 매칭되는지 확인 (예: '맛집 탐방')
    if (interestCategory.items.some(item => normalize(item) === normalizedCategory)) {
      return interestCategory.icon;
    }
  }
  
  // 매칭되지 않으면 기본 이모티콘
  return '✨';
};

const RecommendedMeetingCard: React.FC<RecommendedMeetingCardProps> = ({ meeting }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(meeting.isLiked || false);
  const { toggleLikeMeeting } = useMeetings();

  // meeting.isLiked 변경 시 로컬 상태 동기화
  useEffect(() => {
    setIsLiked(meeting.isLiked || false);
  }, [meeting.isLiked]);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // useMeetings의 통합 toggleLikeMeeting 사용 (자동으로 모든 캐시 무효화)
    toggleLikeMeeting(meeting.groupId);
  };

  const handleGoToMeeting = () => {
    navigate(`/meetings/${meeting.groupId}`);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      {/* 1. Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={meeting.image} 
          alt="background" 
          className="w-full h-full object-cover opacity-60 blur-3xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/95" />
      </div>

      {/* 2. Main Content Container */}
      <div className="absolute inset-0 z-10 flex flex-col items-center px-6 pt-10 pb-[90px]">
        
        {/* Header Section (Fixed Height) */}
        <div className="shrink-0 flex flex-col items-center gap-2 mb-2 w-full">
          <h2 className="text-white text-xl font-bold flex items-center justify-center gap-2 drop-shadow-md text-center w-full truncate">
             {getCategoryEmoji(meeting.category)} {meeting.title}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="bg-secondary/90 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm backdrop-blur-md">
              {meeting.location}
            </span>
            <span className="bg-mint/90 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm backdrop-blur-md">
              {meeting.category}
            </span>
            <span className="bg-purple/90 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm backdrop-blur-md">
              멤버 {meeting.members}
            </span>
          </div>
        </div>

        {/* Center Section: Main Card Image (Flexible Height) */}
        <div className="flex-1 w-full min-h-0 flex items-center justify-center py-4">
          <div className="relative w-full h-full max-h-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-gray-200 ring-1 ring-white/10 flex items-center justify-center">
            {meeting.image && !meeting.image.includes('logo') ? (
              <img 
                src={meeting.image} 
                alt={meeting.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={defaultLogo} 
                alt="로고" 
                className="w-20 h-20 object-contain"
              />
            )}
            <button 
              onClick={handleLike}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/30 backdrop-blur-md transition-all active:scale-95 hover:bg-black/50 border border-white/10"
            >
              <Heart 
                size={22} 
                className={`transition-colors ${isLiked ? 'fill-primary text-primary' : 'text-white'}`}
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>

        {/* Bottom Section: Description & CTA (Fixed Height) */}
        <div className="shrink-0 w-full flex flex-col gap-4">
          <p className="text-white text-[15px] font-medium text-center leading-relaxed drop-shadow-lg px-2 line-clamp-2 break-keep opacity-95">
            "{meeting.description?.trim() || '모임 설명이 없습니다.'}"
          </p>

          <Button 
            fullWidth 
            size="lg" 
            onClick={handleGoToMeeting}
            className="bg-primary hover:bg-rose-600 border-none text-white font-bold text-lg shadow-xl h-[52px] rounded-xl z-30"
          >
            모임 바로가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecommendedMeetingCard;
