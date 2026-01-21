import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import MeetingCard from '@/shared/components/ui/MeetingCard';
import meetingApi from '@/shared/api/meeting/meetingApi';
import { useMeetings, transformMeetingsToUI } from '../hooks/useMeetings';
import type { MeetingUI } from '@/shared/types/Meeting.types';

const MeetingSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { meetings, toggleLike } = useMeetings();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 디바운스 처리 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // API 검색 호출
  const { data: apiSearchResults, isLoading: isSearching, error: searchError } = useQuery({
    queryKey: ['meetings', 'search', debouncedQuery],
    queryFn: async () => {
      const response = await meetingApi.search(debouncedQuery);
      return transformMeetingsToUI(response.data.items);
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });

  // 로컬 필터링 (API 실패 시 fallback)
  const localSearchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const query = debouncedQuery.toLowerCase();
    return meetings.filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(query) ||
        meeting.category.toLowerCase().includes(query) ||
        meeting.location.toLowerCase().includes(query)
    );
  }, [debouncedQuery, meetings]);

  // API 성공 시 API 결과, 실패 시 로컬 결과 사용
  const searchResults: MeetingUI[] = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    if (searchError) {
      console.warn('검색 API 호출 실패, 로컬 필터링 사용:', searchError);
      return localSearchResults;
    }
    return apiSearchResults || localSearchResults;
  }, [debouncedQuery, apiSearchResults, searchError, localSearchResults]);

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
        ) : isSearching ? (
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
                onLike={() => toggleLike(meeting.groupId)}
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
