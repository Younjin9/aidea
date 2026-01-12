import React from 'react';
import RecommendedMeetingCard from './RecommendedMeetingCard';

const MOCK_MEETINGS = [
  {
    id: 1,
    title: '여행 미치광이들!',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop',
    location: '서울/경기',
    category: '여행',
    members: 124,
    description: '매달 떠나는 국내/해외 여행! 혼자 가기 두려웠던 여행지, 이제 함께 떠나요. 2030 직장인 위주로 운영됩니다.'
  },
  {
    id: 2,
    title: '퇴근 후 풋살 한 판?',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bde9be2b?q=80&w=1000&auto=format&fit=crop',
    location: '강남구',
    category: '운동',
    members: 28,
    description: '초보자도 환영합니다! 매주 목요일 저녁 8시, 땀 흘리며 스트레스 날려버려요. 끝나고 시원한 맥주까지!'
  },
  {
    id: 3,
    title: '사색과 토론의 밤',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop',
    location: '홍대입구',
    category: '독서',
    members: 15,
    description: '한 달에 한 권, 깊이 있게 읽고 이야기 나눕니다. 이번 달 선정 도서는 "참을 수 없는 존재의 가벼움" 입니다.'
  },
  {
    id: 4,
    title: '와인에 빠지다',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000&auto=format&fit=crop',
    location: '이태원',
    category: '사교/술',
    members: 56,
    description: '와인을 잘 몰라도 괜찮아요. 다양한 와인을 시음해보며 취향을 찾아가는 즐거운 모임입니다.'
  },
];

const ShortsFeed: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
      {MOCK_MEETINGS.map((meeting) => (
        <div key={meeting.id} className="w-full h-full snap-start snap-always relative">
          <RecommendedMeetingCard meeting={meeting} />
        </div>
      ))}
    </div>
  );
};

export default ShortsFeed;
