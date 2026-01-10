import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import logo from '@/assets/images/logo.png';
import MeetingListCard from './MeetingListCard';
import { useMeetingStore } from '../store/meetingStore';
import type { MeetingUI } from '@/shared/types/Meeting.types';

const MOCK_MEETINGS: MeetingUI[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
    title: '웹 개발 스터디',
    category: '스터디',
    location: '강남역 근처 카페',
    members: 5,
    date: '2024-01-15 18:00',
    isLiked: false,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
    title: '영어 회화 스터디',
    category: '스터디',
    location: '홍대 카페',
    members: 8,
    date: '2024-01-16 19:00',
    isLiked: false,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
    title: '독서 클럽',
    category: '동호회',
    location: '종로구 도서관',
    members: 12,
    date: '2024-01-20 14:00',
    isLiked: false,
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
    title: '주말 배드민턴',
    category: '스포츠',
    location: '강남 배드민턴장',
    members: 6,
    date: '2024-01-21 10:00',
    isLiked: false,
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
    title: 'UI/UX 디자인 스터디',
    category: '스터디',
    location: '강남역',
    members: 4,
    date: '2024-01-22 18:30',
    isLiked: false,
  },
];

const MeetingListPage: React.FC = () => {
  const navigate = useNavigate();
  const { meetings, setMeetings, toggleLike, groupByCategory } = useMeetingStore();

  // 초기 데이터 로드 (실제로는 React Query 사용)
  useEffect(() => {
    setMeetings(MOCK_MEETINGS);
  }, [setMeetings]);

  const groupedMeetings = groupByCategory();

  const renderMeetingCard = (meeting: MeetingUI) => (
    <MeetingListCard
      key={meeting.id}
      meeting={meeting}
      onClick={() => navigate(`/meetings/${meeting.id}`)}
      onLike={() => toggleLike(meeting.id)}
      showLikeButton={true}
    />
  );

  return (
    <div className="relative flex flex-col h-full bg-white">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src={logo} alt="AIMO" className="w-8 h-8 object-contain" />
        </div>
        <button onClick={() => navigate('/search')}>
          <Search size={24} className="text-gray-600" />
        </button>
      </header>

      {/* 모임 목록 */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 no-scrollbar">
        {/* 카테고리별 섹션 */}
        {Object.entries(groupedMeetings).map(([category, items]) => (
          <section key={category} className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">📌</span>
              {category}
            </h2>
            <div className="space-y-4">
              {items.map((meeting) => renderMeetingCard(meeting))}
            </div>
          </section>
        ))}
      </div>

      {/* 모임 개설 버튼 */}
      <div className="fixed bottom-24 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-[430px] mx-auto px-6 flex justify-end pointer-events-auto">
          <button
            onClick={() => navigate('/meetings/create')}
            className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus size={28} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingListPage;