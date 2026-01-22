// 모임 상세 페이지
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Ellipsis, UsersRound, Crown } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import Button from '@/shared/components/ui/Button';
import Modal from '@/shared/components/ui/Modal';
import ChatRoomPage from '@/features/chat/components/ChatRoomPage';
import type { MeetingDetail, MeetingEvent } from '@/shared/types/Meeting.types';

// TODO: API로 대체
const MOCK_CURRENT_USER = { userId: 'user3', nickname: '새유저', profileImage: undefined as string | undefined };

const MOCK_MEETING_DETAIL: MeetingDetail = {
  groupId: '1',
  title: '맛집 탐방',
  description: '우리와 함께 맛집을 탐방해보세요. 다양한 맛을 즐길 수 있습니다.',
  imageUrl: 'https://i.pinimg.com/736x/44/e7/7e/44e77e3a2d34a147afc6a384ebd7a42f.jpg',
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
    { userId: 'user1', nickname: '김구름', profileImage: undefined, role: 'HOST', status: 'APPROVED', joinedAt: '2024-01-20' },
    { userId: 'user2', nickname: '김구름2', profileImage: undefined, role: 'MEMBER', status: 'APPROVED', joinedAt: '2024-01-20' },
  ],
  events: [{
    eventId: '1',
    title: '성수 맛집 탐방',
    scheduledAt: '2024-01-22 11:00',
    participantCount: 2,
    participants: [
      { userId: 'user1', nickname: '김구름', profileImage: undefined, isHost: true },
      { userId: 'user2', nickname: '김구름2', profileImage: undefined },
    ],
  }],
  myRole: 'HOST',
  myStatus: undefined,
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const dateStr = date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', weekday: 'short' });
  const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} ${timeStr}`;
};

const MeetingDetailPage: React.FC = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const locationState = useLocation().state as { newEvent?: MeetingEvent } | null;

  // State
  const [activeTab, setActiveTab] = useState<'home' | 'chat'>('home');
  const [isLiked, setIsLiked] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [meeting, setMeeting] = useState<MeetingDetail>(() => {
    if (locationState?.newEvent) {
      window.history.replaceState({}, document.title);
      return { ...MOCK_MEETING_DETAIL, events: [...MOCK_MEETING_DETAIL.events, locationState.newEvent] };
    }
    return MOCK_MEETING_DETAIL;
  });

  // Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGreetingModal, setShowGreetingModal] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showCancelEventModal, setShowCancelEventModal] = useState(false);
  const [showJoinEventModal, setShowJoinEventModal] = useState(false);
  const [showJoinMeetingFirstModal, setShowJoinMeetingFirstModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string } | null>(null);

  // Derived State
  const isHost = meeting.myRole === 'HOST';
  const isMember = meeting.myStatus === 'APPROVED';

  // Handlers
  const handleCancelEvent = () => {
    if (!selectedEvent) return;
    setMeeting(prev => ({ ...prev, events: prev.events.filter(e => e.eventId !== selectedEvent.id) }));
    setSelectedEvent(null);
    setShowCancelEventModal(false);
  };

  const handleJoinEvent = () => {
    if (!selectedEvent) return;
    setMeeting(prev => ({
      ...prev,
      events: prev.events.map(e =>
        e.eventId === selectedEvent.id
          ? { ...e, participantCount: e.participantCount + 1, participants: [...(e.participants || []), MOCK_CURRENT_USER] }
          : e
      ),
    }));
    setSelectedEvent(null);
    setShowJoinEventModal(false);
  };

  const handleJoinClick = () => {
    if (MOCK_CURRENT_USER.profileImage) {
      setShowGreetingModal(true);
    } else {
      setShowProfileModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center p-4 relative">
          <BackButton />
          <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold text-sm">{meeting.title}</h1>
          <div className="flex items-center gap-1 ml-auto">
            {activeTab === 'chat' ? (
              <div className="flex items-center gap-1 text-gray-900 border border-gray-200 rounded-full px-2 py-0.5 text-xs font-semibold">
                <UsersRound size={14} />
                <span>{meeting.memberCount}</span>
              </div>
            ) : (
              <>
                <button onClick={() => setIsLiked(!isLiked)} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <Heart size={20} fill={isLiked ? '#e91e63' : 'none'} stroke={isLiked ? '#e91e63' : 'currentColor'} />
                </button>
                <button onClick={() => setShowActionSheet(true)} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <Ellipsis size={20} />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex px-4 border-t border-gray-100">
          {(['home', 'chat'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 font-medium text-sm relative text-center ${activeTab === tab ? 'text-black' : 'text-gray-500'}`}
            >
              {tab === 'home' ? '홈' : '채팅'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-dark" />}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className={`flex-1 flex flex-col relative ${activeTab === 'home' ? 'overflow-y-auto pb-20' : 'overflow-hidden pb-0'}`}>
        {activeTab === 'home' ? (
          <>
            {/* Meeting Image */}
            <div className="w-full h-64 bg-gray-200">
              {meeting.imageUrl && <img src={meeting.imageUrl} alt={meeting.title} className="w-full h-full object-cover" />}
            </div>

            {/* Meeting Info */}
            <section className="p-4 border-b border-gray-200">
              <div className="flex gap-2 mb-2">
                <span className="px-3 py-1 bg-mint text-white rounded-full text-xs font-medium">{meeting.interestCategoryName}</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{meeting.location.region}</span>
              </div>
              <h2 className="font-bold text-lg mb-3">{meeting.title}</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{meeting.description}</p>
            </section>

            {/* Events */}
            <section className="p-4 space-y-6">
              {meeting.events.map((event) => (
                <div key={event.eventId} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <h3 className="font-semibold text-sm mb-3">{event.title}</h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex gap-3"><p className="text-gray-500 w-12">일시</p><p className="font-medium">{formatDateTime(event.scheduledAt)}</p></div>
                    <div className="flex gap-3"><p className="text-gray-500 w-12">위치</p><p className="font-medium">{event.location || meeting.location.region}</p></div>
                    <div className="flex gap-3"><p className="text-gray-500 w-12">비용</p><p className="font-medium">{event.cost || '무료'}</p></div>
                    <div className="flex gap-3"><p className="text-gray-500 w-12">참석</p><p className="font-medium">{event.participantCount}명 ({event.participantCount}/{event.maxParticipants || meeting.maxMembers})</p></div>
                  </div>

                  {/* Participants */}
                  {event.participants && event.participants.length > 0 && (
                    <div className="flex gap-2 mb-3 items-center">
                      {event.participants.slice(0, 3).map((p) => (
                        <div key={p.userId} className="relative">
                          <ProfileImage src={p.profileImage} alt={p.nickname} size="sm" className="border-2 border-white" />
                          {p.isHost && (
                            <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white">
                              <Crown size={12} className="text-white fill-white" />
                            </div>
                          )}
                        </div>
                      ))}
                      {event.participants.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold border-2 border-white">
                          +{event.participants.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="md" className="flex-1">공유</Button>
                    {isHost ? (
                      <Button variant="primary" size="md" className="flex-1" onClick={() => { setSelectedEvent({ id: event.eventId, title: event.title }); setShowCancelEventModal(true); }}>
                        취소
                      </Button>
                    ) : (
                      <Button variant="primary" size="md" className="flex-1" onClick={() => isMember ? (setSelectedEvent({ id: event.eventId, title: event.title }), setShowJoinEventModal(true)) : setShowJoinMeetingFirstModal(true)}>
                        참석
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {isHost && (
                <Button variant="primary" size="md" fullWidth onClick={() => navigate(`/meetings/${meetingId}/events/create`)}>
                  정모 만들기
                </Button>
              )}
            </section>

            {/* Members */}
            <section className="px-4 pb-8 border-t border-gray-200">
              <div className="flex items-center justify-between py-4">
                <h3 className="font-semibold">멤버</h3>
                {isHost && (
                  <button onClick={() => navigate(`/meetings/${meetingId}/members`)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:opacity-60 transition">
                    <UsersRound size={16} />관리
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {meeting.members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3 py-2">
                    <ProfileImage src={member.profileImage} alt={member.nickname} size="md" />
                    <p className="font-medium text-sm">{member.nickname}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <ChatRoomPage />
        )}
      </main>

      {/* Fixed Bottom Button */}
      {!isHost && !isMember && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[398px] px-4">
          <Button variant="primary" size="md" fullWidth onClick={handleJoinClick}>참석하기</Button>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        message="프로필 사진을 등록해주세요."
        showLogo={true}
        confirmText="OK"
        singleButton={true}
        onConfirm={() => navigate('/mypage/edit')}
      />

      <Modal
        isOpen={showGreetingModal}
        onClose={() => setShowGreetingModal(false)}
        message="가입인사를 작성해주세요."
        image={<ProfileImage src={undefined} alt="프로필" size="md" />}
        showInput={true}
        inputPlaceholder="가입인사를 작성해주세요!"
        inputValue={greeting}
        onInputChange={setGreeting}
        confirmText="확인"
        cancelText="취소"
      />

      <Modal
        type="bottom"
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        actions={[
          { label: '모임 신고하기', onClick: () => console.log('신고하기') },
          { label: '모임 탈퇴하기', onClick: () => console.log('탈퇴하기'), variant: 'danger' },
        ]}
      />

      <Modal
        isOpen={showCancelEventModal}
        onClose={() => { setShowCancelEventModal(false); setSelectedEvent(null); }}
        message="정모를 취소하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleCancelEvent}
      />

      <Modal
        isOpen={showJoinEventModal}
        onClose={() => { setShowJoinEventModal(false); setSelectedEvent(null); }}
        message={`"${selectedEvent?.title}" 정모에 참여하시겠습니까?`}
        confirmText="참여"
        cancelText="취소"
        onConfirm={handleJoinEvent}
      />

      <Modal
        isOpen={showJoinMeetingFirstModal}
        onClose={() => setShowJoinMeetingFirstModal(false)}
        message="모임에 먼저 가입 후 참석할 수 있습니다."
        confirmText="확인"
        singleButton={true}
        onConfirm={() => setShowJoinMeetingFirstModal(false)}
      />
    </div>
  );
};

export default MeetingDetailPage;