import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import Button from '@/shared/components/ui/Button';

// Mock Data Type
interface Meeting {
  id: number;
  title: string;
  image: string;
  location: string;
  category: string;
  members: number;
  description: string;
}

interface RecommendedMeetingCardProps {
  meeting: Meeting;
}

const RecommendedMeetingCard: React.FC<RecommendedMeetingCardProps> = ({ meeting }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
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
             ✈️ {meeting.title}
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
          <div className="relative w-full h-full max-h-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-gray-800/50 ring-1 ring-white/10">
            <img 
              src={meeting.image} 
              alt={meeting.title} 
              className="w-full h-full object-cover"
            />
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
            "{meeting.description}"
          </p>

          <Button 
            fullWidth 
            size="lg" 
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
