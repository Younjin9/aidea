import React from 'react';
import RecommendedMeetingCard from './RecommendedMeetingCard';
import { useMeetingStore } from '@/features/meeting/store/meetingStore';

const ShortsFeed: React.FC = () => {
  const { meetings } = useMeetingStore();

  if (!meetings || meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white">
        <p className="text-gray-400">추천할 모임이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
      {meetings.map((meeting) => (
        <div key={meeting.id} className="w-full h-full snap-start snap-always relative">
          <RecommendedMeetingCard meeting={meeting} />
        </div>
      ))}
    </div>
  );
};

export default ShortsFeed;
