import React from 'react';
import type { MeetingDetail } from '@/shared/types/Meeting.types';
import defaultLogo from '@/assets/images/logo.png';

const MeetingImage: React.FC<{ imageUrl?: string; title: string }> = ({ imageUrl, title }) => (
  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
    {imageUrl && !imageUrl.includes('logo') ? (
      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
    ) : (
      <img src={defaultLogo} alt="로고" className="w-20 h-20 object-contain opacity-50 mx-auto" />
    )}
  </div>
);

const MeetingInfoSection: React.FC<{ meeting: MeetingDetail }> = ({ meeting }) => (
  <section>
    <MeetingImage imageUrl={meeting.imageUrl} title={meeting.title} />
    <div className="p-4 border-b border-gray-200">
      <div className="flex gap-2 mb-2">
        <span className="px-3 py-1 bg-mint text-white rounded-full text-xs font-medium">{meeting.interestCategoryName}</span>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{meeting.region}</span>
      </div>
      <h2 className="font-bold text-lg mb-3">{meeting.title}</h2>
      <p className="text-gray-700 text-sm leading-relaxed">{meeting.description}</p>
    </div>
  </section>
);

export default MeetingInfoSection;
