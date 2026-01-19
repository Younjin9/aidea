import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import MeetingCard from '@/shared/components/ui/MeetingCard';
import { useMeetings } from '../hooks/useMeetings';

const MeetingSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { meetings, toggleLike } = useMeetings();
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 결과 필터링
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return meetings.filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(query) ||
        meeting.category.toLowerCase().includes(query) ||
        meeting.location.toLowerCase().includes(query)
    );
  }, [searchQuery, meetings]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with Search Input */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <BackButton />
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색어 입력"
            autoFocus
            className="w-full py-2 pl-3 pr-10 text-sm bg-gray-100 rounded-lg outline-none"
          />
        </div>
        <button className="p-1">
          <Search size={20} className="text-gray-600" />
        </button>
      </header>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        {searchQuery.trim() === '' ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">검색어를 입력해주세요</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onClick={() => navigate(`/meetings/${meeting.id}`)}
                onLike={() => toggleLike(String(meeting.id), meeting.isLiked || false)}
                showLikeButton={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingSearchPage;
