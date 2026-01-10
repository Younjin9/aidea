import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import MeetingListCard from '@/features/meeting/components/MeetingListCard';
import logo from '@/assets/images/logo.png';
import type { MeetingUI } from '@/shared/types/Meeting.types';
import type { User } from '@/shared/types/MyPage.types';

const MOCK_USER = {
  nickname: '김구름',
  profileImage: '',
  bio: '서울 중구',
  interests: ['맛집 탐방', '취미 활동', '운동/스포츠'],
};

const MOCK_MY_MEETINGS: MeetingUI[] = [
  {
    id: 1,
    image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAxOTA1MTZfMTMg%2FMDAxNTU4MDE3MzY3Mzk1.9HCj1nFR8Q1Ho1vdxodzd332xbOB-POZiZ6a13hip9kg.mDh2PiIKVmEc5Xu9Fjs4-XhHYNbIyje7ugBHViJg8CYg.PNG.cherewu%2F1558017337291.png&type=sc960_832',
    title: '맛집 탐방',
    category: '맛집 투어',
    location: '서울 · 마포구',
    members: 4,
    date: '오늘 · 오후 6시 30분',
    isLiked: false,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    title: '홍대 맛집 탐방',
    category: '맛집 투어',
    location: '서울 · 마포구',
    members: 4,
    date: '오늘 · 오후 7시 30분',
    isLiked: false,
  },
];

const MOCK_LIKED_MEETINGS: MeetingUI[] = [
  {
    id: 3,
    image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTExMTFfMjI2%2FMDAxNzYyODIzODIwMjcy.LULBVH9Nt4A1r5XMdCEL9rA7b06xOk7xDQpf1TNOLCQg.ceyfsKWEzUAVUISgdhP7-0VtYJ5B2Hc_sftZhGOvWkMg.JPEG%2F900%25A3%25DF1762743095069.jpg&type=sc960_832',
    title: '퇴근 후 풋살 모임',
    category: '운동/스포츠',
    location: '서울 · 중구',
    members: 10,
    date: '오늘 · 오후 7시 30분',
    isLiked: true,
  },
  {
    id: 4,
    image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTA0MDNfMjIz%2FMDAxNzQzNjUxNjU0MzY3.KoERpm42v7L5iMTlDOGDz1n7hTsVb59MNcYTyMNC7U0g.iKDfksImrgAqLObGD-rZqjPkghlBQ6z6Eoi-EdYfA3Eg.JPEG%2F900%25A3%25DFScreenshot%25A3%25DF20250403%25A3%25DFPinterest.jpg&type=sc960_832',
    title: '배드민턴 할 사람!!',
    category: '운동/스포츠',
    location: '서울 · 중구',
    members: 10,
    date: '오늘 · 오후 8시 30분',
    isLiked: true,
  },
];

interface MyPageViewProps {
  onUnlike?: (id: number) => void;
}

const MyPageView: React.FC<MyPageViewProps> = ({ onUnlike }) => {
  const navigate = useNavigate();

  const renderMeetingCard = (meeting: MeetingUI, showLikeButton: boolean = false) => (
    <MeetingListCard
      key={meeting.id}
      meeting={meeting}
      onClick={() => navigate(`/meetings/${meeting.id}`)}
      onLike={() => onUnlike?.(meeting.id)}
      showLikeButton={showLikeButton}
    />
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <img src={logo} alt="AIMO" className="w-8 h-8 object-contain" />
        <h1 className="text-lg font-bold text-gray-900">MyPage</h1>
        <div className="w-8" />
      </header>

      <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <ProfileImage
              src={MOCK_USER.profileImage}
              alt={MOCK_USER.nickname}
              fallback={MOCK_USER.nickname}
              size="lg"
            />

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-gray-900">{MOCK_USER.nickname}</h2>
                <button onClick={() => navigate('/profile/edit')} className="p-1">
                  <Edit2 size={18} className="text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-3">{MOCK_USER.bio}</p>
              <div className="flex flex-wrap gap-2">
                {MOCK_USER.interests.map((interest, index) => (
                  <span key={index} className="px-3 py-1 bg-mint text-white text-xs rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">내 모임</h3>
            <button onClick={() => navigate('/my-meetings')} className="text-sm text-gray-500">
              전체 보기
            </button>
          </div>
          <div className="space-y-4">
            {MOCK_MY_MEETINGS.map((meeting) => renderMeetingCard(meeting, false))}
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">찜 목록</h3>
            <button onClick={() => navigate('/liked-meetings')} className="text-sm text-gray-500">
              전체 보기
            </button>
          </div>
          <div className="space-y-4">
            {MOCK_LIKED_MEETINGS.map((meeting) => renderMeetingCard(meeting, true))}
          </div>
        </div>

        <div className="px-6 py-4 text-center">
          <button className="text-sm text-gray-400 underline">로그아웃 · 회원탈퇴</button>
        </div>
      </div>
    </div>
  );
};

export default MyPageView;