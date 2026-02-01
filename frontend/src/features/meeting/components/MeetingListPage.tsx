import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import logo from '@/assets/images/logo.png';
import MeetingCard from '@/shared/components/ui/MeetingCard';
import { useMeetings } from '../hooks/useMeetings';
import { INTEREST_CATEGORIES } from '@/shared/config/constants';

const MeetingListPage: React.FC = () => {
  const navigate = useNavigate();
  const { meetings, isLoading, groupByCategory, toggleLikeMeeting } = useMeetings();

  const groupedMeetings = groupByCategory();

  // 카테고리별 이모티콘 찾기
  const getCategoryIcon = (categoryName: string) => {
    // 1. 대분류 label과 정확 일치
    const exactMatch = INTEREST_CATEGORIES.find((cat) => cat.label === categoryName);
    if (exactMatch) return exactMatch.icon;
    
    // 2. 세부 카테고리 items에 포함
    const itemMatch = INTEREST_CATEGORIES.find((cat) => 
      cat.items.some((item) => item === categoryName)
    );
    if (itemMatch) return itemMatch.icon;
    
    // 3. 부분 문자열 매칭
    const partialMatch = INTEREST_CATEGORIES.find((cat) => {
      const mainKeyword = cat.label.split(' /')[0].trim();
      return categoryName.includes(mainKeyword);
    });
    
    return partialMatch?.icon || '';
  };

  return (
    <div className="relative flex flex-col h-full bg-white">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src={logo} alt="AIMO" className="w-8 h-8 object-contain" />
        </div>
        <button onClick={() => navigate('/search')}>
          <Search size={20} className="text-gray-600" />
        </button>
      </header>

      {/* 모임 목록 */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32 no-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">로딩 중...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">아직 개설된 모임이 없어요</p>
          </div>
        ) : (
          Object.entries(groupedMeetings).map(([category, items]) => (
            <section key={category} className="mb-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">{getCategoryIcon(category)}</span>
                {category}
              </h2>
              <div className="space-y-4">
                {items.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onClick={() => navigate(`/meetings/${meeting.groupId}`)}
                    onLike={() => {
                      console.log(`[MeetingListPage] Like clicked for ${meeting.groupId}`);
                      toggleLikeMeeting(meeting.groupId);
                    }}
                    showLikeButton={true}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* 모임 개설 버튼 */}
      <div className="fixed bottom-24 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-[430px] mx-auto px-6 flex justify-end pointer-events-auto">
          <button
            onClick={() => navigate('/meetings/create')}
            className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            aria-label="모임 개설"
          >
            <Plus size={28} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default MeetingListPage;
