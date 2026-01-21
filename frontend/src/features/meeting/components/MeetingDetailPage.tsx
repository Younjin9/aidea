import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Ellipsis, UsersRound, Crown } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import type { MeetingDetail } from '@/shared/types/Meeting.types';

// TODO: 실제 API에서 데이터 가져오기
const MOCK_MEETING_DETAIL: MeetingDetail = {
  groupId: '1',
  title: '맛집 탐방',
  description: '우리와 함께 맛집을 탐방해보세요. 다양한 맛을 즐길 수 있습니다.',
  imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
  interestCategoryId: '1',
  interestCategoryName: '맛집 탐방',
  memberCount: 2,
  maxMembers: 10,
  location: { lat: 37.5665, lng: 126.978, region: '성수동' },
  distanceKm: 0,
  isPublic: true,
  ownerUserId: 'user1',
  createdAt: '2024-01-20',
  updatedAt: '2024-01-20',
  members: [
    {
      userId: 'user1',
      nickname: '김구름',
      profileImage: undefined,
      role: 'HOST',
      status: 'APPROVED',
      joinedAt: '2024-01-20',
    },
    {
      userId: 'user2',
      nickname: '김구름2',
      profileImage: undefined,
      role: 'MEMBER',
      status: 'APPROVED',
      joinedAt: '2024-01-20',
    },
  ],
  events: [
    {
      eventId: '1',
      title: '디지털 맛집 탐방',
      scheduledAt: '2024-01-22 11:00',
      participantCount: 2,
    },
  ],
  myRole: 'HOST', // TODO: 실제 사용자의 역할로 변경
  myStatus: 'APPROVED', // TODO: 실제 사용자의 상태로 변경
};

type TabType = 'home' | 'chat';

const MeetingDetailPage: React.FC = () => {
  const { meetingId } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isLiked, setIsLiked] = useState(false);
  const [meeting] = useState<MeetingDetail>(MOCK_MEETING_DETAIL);

  const isHost = meeting.myRole === 'HOST';
  const eventInfo = meeting.events[0];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between p-4">
          <BackButton />
          <h1 className="flex-1 text-center font-semibold text-sm">{meeting.title}</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <Heart
                size={20}
                fill={isLiked ? '#e91e63' : 'none'}
                stroke={isLiked ? '#e91e63' : 'currentColor'}
              />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Ellipsis size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 border-t border-gray-100">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-3 font-medium text-sm relative text-center ${
              activeTab === 'home' ? 'text-black' : 'text-gray-500'
            }`}
          >
            홈
            {activeTab === 'home' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-dark" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 font-medium text-sm relative text-center flex items-center justify-center gap-1 ${
              activeTab === 'chat' ? 'text-black' : 'text-gray-500'
            }`}
          >
            채팅
            {activeTab === 'chat' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-dark" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
          <div>
            {/* Meeting Image */}
            <div className="w-full h-64 bg-gray-200 overflow-hidden">
              <img
                src={meeting.imageUrl}
                alt={meeting.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Meeting Info */}
            <div className="p-4 border-b border-gray-200">
              {/* Category Badges */}
              <div className="flex gap-2 mb-3">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  {meeting.interestCategoryName}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {meeting.location.region}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {meeting.description}
              </p>
            </div>

            {/* Event Details */}
            {eventInfo && (
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-sm mb-3">
                  {eventInfo.title}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div>
                    <p className="text-gray-500">일시</p>
                    <p className="font-medium text-black">
                      {new Date(eventInfo.scheduledAt).toLocaleDateString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        weekday: 'short',
                      })}{' '}
                      {new Date(eventInfo.scheduledAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">위치</p>
                    <p className="font-medium text-black">{meeting.location.region}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">비용</p>
                    <p className="font-medium text-black">50,000</p>
                  </div>
                  <div>
                    <p className="text-gray-500">정원</p>
                    <p className="font-medium text-black">
                      {meeting.memberCount}명 정원중 ({meeting.memberCount}/{meeting.maxMembers})
                    </p>
                  </div>
                </div>

                {/* Member Avatars with Host Crown Badge */}
                <div className="flex gap-2 mb-4 items-center">
                  {meeting.members.slice(0, 3).map((member) => (
                    <div key={member.userId} className="relative">
                      <ProfileImage
                        src={member.profileImage}
                        alt={member.nickname}
                        size="sm"
                        className="border-2 border-white"
                      />
                      {/* Crown badge for host */}
                      {member.role === 'HOST' && (
                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white">
                          <Crown size={12} className="text-white fill-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {meeting.members.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold border-2 border-white">
                      +{meeting.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 space-y-3">
              {isHost ? (
                <>
                  {/* Host View */}
                  <div className="flex gap-2">
                    <button className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
                      공유
                    </button>
                    <button className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition">
                      취소
                    </button>
                  </div>
                  <button className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition">
                    정모 만들기
                  </button>
                </>
              ) : (
                <>
                  {/* Member View */}
                  <div className="flex gap-2">
                    <button className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
                      공유
                    </button>
                    <button className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition">
                      참가
                    </button>
                  </div>
                  <button className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition">
                    참석하기
                  </button>
                </>
              )}
            </div>

            {/* Members Section */}
            <div className="px-4 pb-8 border-t border-gray-200">
              <div className="flex items-center justify-between py-4">
                <h3 className="font-semibold">멤버</h3>
                <button className="px-0 py-0 flex items-center gap-1 text-xs font-semibold text-gray-dark hover:opacity-60 transition">
                  <UsersRound size={16} />
                  관리
                </button>
              </div>

              <div className="space-y-3">
                {meeting.members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3 flex-1">
                      <ProfileImage
                        src={member.profileImage}
                        alt={member.nickname}
                        size="md"
                      />
                      <div>
                        <p className="font-medium text-sm">{member.nickname}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="p-4 text-center py-20">
            <p className="text-gray-500">채팅 기능은 준비 중입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingDetailPage;
