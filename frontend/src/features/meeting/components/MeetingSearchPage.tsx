import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import MeetingCard from '@/shared/components/ui/MeetingCard';
import { useMeetings } from '../hooks/useMeetings';

const MeetingSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { meetings, toggleLikeMeeting, isLoading } = useMeetings({ size: 100 });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 디바운스 처리 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 로컬 필터링 (백엔드가 keyword 검색 미지원으로 프론트에서 처리)
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const query = debouncedQuery.toLowerCase();
    return meetings.filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(query) ||
        meeting.category.toLowerCase().includes(query) ||
        meeting.location.toLowerCase().includes(query) ||
        meeting.description?.toLowerCase().includes(query)
    );
  }, [debouncedQuery, meetings]);

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
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onClick={() => navigate(`/meetings/${meeting.groupId}`)}
                onLike={() => toggleLikeMeeting(meeting.groupId)}
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
