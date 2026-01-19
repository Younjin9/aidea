// 모임 상세 페이지
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Ellipsis, UsersRound, Crown } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import Button from '@/shared/components/ui/Button';
import Modal from '@/shared/components/ui/Modal';
import { useMeetingStore } from '../store/meetingStore';
import { useMyPageStore } from '@/features/mypage/store/myPageStore';
import type { MeetingDetail, MeetingEvent, Meeting } from '@/shared/types/Meeting.types';
import defaultLogo from '@/assets/images/logo.png';

// ===== Constants =====
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
  myRole: 'USER',
  myStatus: undefined,
};

type ModalType = 'profile' | 'greeting' | 'actionSheet' | 'cancelParticipation' | 'joinEvent' | 'joinMeetingFirst' | 'leaveMeeting' | 'report' | null;

// ===== Utility Functions =====
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const dateStr = date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', weekday: 'short' });
  const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} ${timeStr}`;
};

// Mock 정모 데이터 (테스트용)
const MOCK_EVENTS: MeetingEvent[] = [{
  eventId: '1',
  title: '성수 맛집 탐방',
  scheduledAt: '2025-02-15 14:00',
  location: '성수역 2번 출구',
  cost: '각자 계산',
  maxParticipants: 10,
  participantCount: 2,
  participants: [
    { userId: 'user1', nickname: '김구름', profileImage: undefined, isHost: true },
    { userId: 'user2', nickname: '김구름2', profileImage: undefined },
  ],
}];

const createMeetingDetailFromStore = (
  storedMeeting: { id: number; title: string; description?: string; image: string; category: string; members: number; maxMembers?: number; location: string; ownerUserId?: string },
  isOwner: boolean,
  user: { userId: string; nickname: string; profileImage?: string } | null,
  newEvent?: MeetingEvent
): MeetingDetail => {
  const hostUserId = storedMeeting.ownerUserId || 'user1';
  const hostNickname = isOwner ? (user?.nickname || '방장') : '모임장';
  const hostProfileImage = isOwner ? user?.profileImage : undefined;

  // 기본 정모 데이터 (테스트용)
  const defaultEvents = newEvent ? [newEvent] : MOCK_EVENTS;

  const meetingDetail: MeetingDetail = {
    groupId: String(storedMeeting.id),
    title: storedMeeting.title,
    description: storedMeeting.description || '모임 설명이 없습니다.',
    imageUrl: storedMeeting.image,
    interestCategoryId: '1',
    interestCategoryName: storedMeeting.category,
    memberCount: storedMeeting.members,
    maxMembers: storedMeeting.maxMembers || 10,
    location: { lat: 37.5665, lng: 126.978, region: storedMeeting.location },
    distanceKm: 0,
    isPublic: true,
    ownerUserId: hostUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [
      { userId: hostUserId, nickname: hostNickname, profileImage: hostProfileImage, role: 'HOST', status: 'APPROVED', joinedAt: new Date().toISOString() },
    ],
    events: defaultEvents,
    myRole: isOwner ? 'HOST' : 'USER',
    myStatus: undefined,
  };

  return meetingDetail;
};

const createMeetingDetailFromMyPage = (
  myPageMeeting: Meeting,
  isOwner: boolean,
  user: { userId: string; nickname: string; profileImage?: string } | null,
  newEvent?: MeetingEvent
): MeetingDetail => {
  const hostUserId = myPageMeeting.ownerUserId || 'user1';
  const hostNickname = isOwner ? (user?.nickname || '방장') : '모임장';
  const hostProfileImage = isOwner ? user?.profileImage : undefined;

  const defaultEvents = newEvent ? [newEvent] : MOCK_EVENTS;

  return {
    groupId: myPageMeeting.groupId,
    title: myPageMeeting.title,
    description: myPageMeeting.description || '모임 설명이 없습니다.',
    imageUrl: myPageMeeting.imageUrl,
    interestCategoryId: myPageMeeting.interestCategoryId,
    interestCategoryName: myPageMeeting.interestCategoryName,
    memberCount: myPageMeeting.memberCount,
    maxMembers: myPageMeeting.maxMembers || 10,
    location: myPageMeeting.location,
    distanceKm: 0,
    isPublic: myPageMeeting.isPublic,
    ownerUserId: hostUserId,
    createdAt: myPageMeeting.createdAt,
    updatedAt: myPageMeeting.updatedAt,
    members: [
      { userId: hostUserId, nickname: hostNickname, profileImage: hostProfileImage, role: 'HOST', status: 'APPROVED', joinedAt: myPageMeeting.createdAt },
    ],
    events: defaultEvents,
    myRole: isOwner ? 'HOST' : 'USER',
    myStatus: undefined,
  };
};

const convertMeetingDetailToMeeting = (detail: MeetingDetail): Meeting => ({
  groupId: detail.groupId,
  title: detail.title,
  description: detail.description,
  imageUrl: detail.imageUrl,
  interestCategoryId: detail.interestCategoryId,
  interestCategoryName: detail.interestCategoryName,
  memberCount: detail.memberCount,
  maxMembers: detail.maxMembers,
  location: detail.location,
  isPublic: detail.isPublic,
  ownerUserId: detail.ownerUserId,
  createdAt: detail.createdAt,
  updatedAt: detail.updatedAt,
});

// ===== Sub Components =====
interface EventCardProps {
  event: MeetingEvent;
  meeting: MeetingDetail;
  isHost: boolean;
  isMember: boolean;
  isHostParticipating: boolean; // 모임장이 해당 정모에 참석 중인지
  onTitleClick: () => void; // 제목 클릭 (모임장만)
  onCancelParticipation: () => void; // 모임장 참석 취소
  onJoin: () => void;
  onJoinMeetingFirst: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, meeting, isHost, isMember, isHostParticipating, onTitleClick, onCancelParticipation, onJoin, onJoinMeetingFirst }) => (
  <div className="border-b border-gray-100 pb-4 last:border-b-0">
    {isHost ? (
      <h3 className="font-semibold text-sm mb-3 cursor-pointer hover:opacity-60 transition" onClick={onTitleClick}>{event.title}</h3>
    ) : (
      <h3 className="font-semibold text-sm mb-3">{event.title}</h3>
    )}
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
        // HOST: 참석 중이면 취소, 아니면 참석
        isHostParticipating ? (
          <Button variant="primary" size="md" className="flex-1" onClick={onCancelParticipation}>취소</Button>
        ) : (
          <Button variant="primary" size="md" className="flex-1" onClick={onJoin}>참석</Button>
        )
      ) : isMember ? (
        // USER (멤버): 참석 중이면 취소, 아니면 참석
        isHostParticipating ? (
          <Button variant="primary" size="md" className="flex-1" onClick={onCancelParticipation}>취소</Button>
        ) : (
          <Button variant="primary" size="md" className="flex-1" onClick={onJoin}>참석</Button>
        )
      ) : (
        // 비멤버: 모임 먼저 가입 필요
        <Button variant="primary" size="md" className="flex-1" onClick={onJoinMeetingFirst}>참석</Button>
      )}
    </div>
  </div>
);

interface MemberListProps {
  members: MeetingDetail['members'];
}

const MemberList: React.FC<MemberListProps> = ({ members }) => (
  <div className="space-y-3">
    {members.map((member) => (
      <div key={member.userId} className="flex items-center gap-3 py-2">
        <ProfileImage src={member.profileImage} alt={member.nickname} size="md" />
        <p className="font-medium text-sm">{member.nickname}</p>
      </div>
    ))}
  </div>
);

// ===== Main Component =====
const MeetingDetailPage: React.FC = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    newEvent?: MeetingEvent;
    updatedEvent?: MeetingEvent;
    deletedEventId?: string;
    updatedMembers?: MeetingDetail['members'];
  } | null;

  // Store
  const { getMeetingByGroupId, toggleLike } = useMeetingStore();
  const { user, myMeetings, toggleLikedMeeting, addMyMeeting, removeMyMeeting, initializeMockData, isInitialized } = useMyPageStore();

  // Mock 데이터 초기화
  if (!isInitialized) {
    initializeMockData();
  }

  // meetingStore에서 먼저 찾고, 없으면 myPageStore에서 찾기
  const storedMeeting = getMeetingByGroupId(meetingId || '');
  const myPageMeeting = myMeetings.find(m => m.groupId === meetingId);
  const isOwner = storedMeeting?.ownerUserId === user?.userId || myPageMeeting?.ownerUserId === user?.userId;

  // State
  const [activeTab, setActiveTab] = useState<'home' | 'chat'>('home');
  const [isLiked, setIsLiked] = useState(storedMeeting?.isLiked || false);
  const [greeting, setGreeting] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [reportContent, setReportContent] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string } | null>(null);

  const [meeting, setMeeting] = useState<MeetingDetail>(() => {
    // locationState가 있으면 history 정리
    if (locationState) {
      window.history.replaceState({}, document.title);
    }

    // 기본 meeting 데이터 생성
    let baseMeeting: MeetingDetail;
    if (storedMeeting) {
      baseMeeting = createMeetingDetailFromStore(storedMeeting, isOwner, user, locationState?.newEvent);
    } else if (myPageMeeting) {
      baseMeeting = createMeetingDetailFromMyPage(myPageMeeting, isOwner, user, locationState?.newEvent);
    } else {
      baseMeeting = locationState?.newEvent
        ? { ...MOCK_MEETING_DETAIL, events: [...MOCK_MEETING_DETAIL.events, locationState.newEvent] }
        : MOCK_MEETING_DETAIL;
    }

    // 멤버 업데이트 적용
    if (locationState?.updatedMembers) {
      baseMeeting = {
        ...baseMeeting,
        members: locationState.updatedMembers,
        memberCount: locationState.updatedMembers.filter(m => m.status === 'APPROVED').length,
      };
    }

    // 정모 수정 적용
    if (locationState?.updatedEvent) {
      baseMeeting = {
        ...baseMeeting,
        events: baseMeeting.events.map(e => e.eventId === locationState.updatedEvent!.eventId ? locationState.updatedEvent! : e),
      };
    }

    // 정모 삭제 적용
    if (locationState?.deletedEventId) {
      baseMeeting = {
        ...baseMeeting,
        events: baseMeeting.events.filter(e => e.eventId !== locationState.deletedEventId),
      };
    }

    return baseMeeting;
  });

  // Derived State
  const isHost = meeting.myRole === 'HOST';
  const isMember = meeting.myStatus === 'APPROVED';
  const meetingForStore = useMemo(() => convertMeetingDetailToMeeting(meeting), [meeting]);

  // Modal Helpers
  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => {
    setActiveModal(null);
    if (activeModal === 'report') setReportContent('');
    if (activeModal === 'cancelParticipation' || activeModal === 'joinEvent') setSelectedEvent(null);
  };

  // Handlers
  const handleLikeToggle = () => {
    setIsLiked(prev => !prev);
    // meetingStore에 있는 모임이면 해당 store도 업데이트
    if (storedMeeting) {
      toggleLike(storedMeeting.id);
    }
    // myPageStore의 찜 목록 업데이트
    toggleLikedMeeting(meetingForStore);
  };

  // 모임장 참석 취소 핸들러
  const handleCancelParticipation = () => {
    if (!selectedEvent || !user) return;
    setMeeting(prev => ({
      ...prev,
      events: prev.events.map(e =>
        e.eventId === selectedEvent.id
          ? { ...e, participantCount: Math.max(0, e.participantCount - 1), participants: (e.participants || []).filter(p => p.userId !== user.userId) }
          : e
      ),
    }));
    closeModal();
  };

  const handleJoinEvent = () => {
    if (!selectedEvent || !user) return;
    setMeeting(prev => ({
      ...prev,
      events: prev.events.map(e =>
        e.eventId === selectedEvent.id
          ? { ...e, participantCount: e.participantCount + 1, participants: [...(e.participants || []), { userId: user.userId, nickname: user.nickname, profileImage: user.profileImage, isHost: isHost }] }
          : e
      ),
    }));
    closeModal();
  };

  const handleJoinClick = () => openModal(user?.profileImage ? 'greeting' : 'profile');

  const handleJoinMeeting = () => {
    if (!user) return;
    setMeeting(prev => ({
      ...prev,
      memberCount: prev.memberCount + 1,
      members: [...prev.members, { userId: user.userId, nickname: user.nickname, profileImage: user.profileImage, role: 'MEMBER', status: 'APPROVED', joinedAt: new Date().toISOString() }],
      myStatus: 'APPROVED',
    }));
    addMyMeeting({ ...meetingForStore, memberCount: meeting.memberCount + 1 });
    setGreeting('');
    closeModal();
  };

  const handleReportMeeting = () => {
    console.log('신고 내용:', reportContent);
    closeModal();
    alert('신고가 접수되었습니다.');
  };

  const handleLeaveMeeting = () => {
    if (!user) return;
    setMeeting(prev => ({
      ...prev,
      memberCount: prev.memberCount - 1,
      members: prev.members.filter(m => m.userId !== user.userId),
      myStatus: undefined,
    }));
    removeMyMeeting(meeting.groupId);
    closeModal();
    navigate('/meetings');
  };

  // 정모 제목 클릭 → 수정 페이지로 이동
  const handleEventTitleClick = (event: MeetingEvent) => {
    navigate(`/meetings/${meetingId}/events/${event.eventId}/edit`, { state: { event } });
  };

  // 참석 취소/참석 액션
  const handleEventAction = (eventId: string, title: string, action: 'cancelParticipation' | 'join') => {
    setSelectedEvent({ id: eventId, title });
    openModal(action === 'cancelParticipation' ? 'cancelParticipation' : 'joinEvent');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center p-4 relative">
          <BackButton />
          <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold text-sm">{meeting.title}</h1>
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={handleLikeToggle} className="p-2 hover:bg-gray-100 rounded-full transition">
              <Heart size={20} fill={isLiked ? '#e91e63' : 'none'} stroke={isLiked ? '#e91e63' : 'currentColor'} />
            </button>
            <button onClick={() => openModal('actionSheet')} className="p-2 hover:bg-gray-100 rounded-full transition">
              <Ellipsis size={20} />
            </button>
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
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' ? (
          <>
            {/* Meeting Image */}
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              {meeting.imageUrl && !meeting.imageUrl.includes('logo') ? (
                <img src={meeting.imageUrl} alt={meeting.title} className="w-full h-full object-cover" />
              ) : (
                <img src={defaultLogo} alt="로고" className="w-20 h-20 object-contain opacity-50 mx-auto" />
              )}
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
              {meeting.events.length > 0 ? (
                meeting.events.map((event) => {
                  const isHostParticipating = (event.participants || []).some(p => p.userId === user?.userId);
                  return (
                    <EventCard
                      key={event.eventId}
                      event={event}
                      meeting={meeting}
                      isHost={isHost}
                      isMember={isMember}
                      isHostParticipating={isHostParticipating}
                      onTitleClick={() => handleEventTitleClick(event)}
                      onCancelParticipation={() => handleEventAction(event.eventId, event.title, 'cancelParticipation')}
                      onJoin={() => handleEventAction(event.eventId, event.title, 'join')}
                      onJoinMeetingFirst={() => openModal('joinMeetingFirst')}
                    />
                  );
                })
              ) : (
                <p className="text-center text-sm text-gray-400 py-4">예정된 정모가 없습니다</p>
              )}
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
                  <button onClick={() => navigate(`/meetings/${meetingId}/members`, { state: { members: meeting.members } })} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:opacity-60 transition">
                    <UsersRound size={16} />관리
                  </button>
                )}
              </div>
              <MemberList members={meeting.members} />
            </section>
          </>
        ) : (
          <div className="p-4 text-center py-20">
            <p className="text-gray-500">채팅 기능은 준비 중입니다.</p>
          </div>
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
        isOpen={activeModal === 'profile'}
        onClose={closeModal}
        message="프로필 사진을 등록해주세요."
        showLogo
        confirmText="OK"
        singleButton
        onConfirm={() => navigate('/mypage/edit')}
      />

      <Modal
        isOpen={activeModal === 'greeting'}
        onClose={closeModal}
        message="가입인사를 작성해주세요."
        image={<ProfileImage src={user?.profileImage} alt="프로필" size="md" />}
        showInput
        inputPlaceholder="가입인사를 작성해주세요!"
        inputValue={greeting}
        onInputChange={setGreeting}
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleJoinMeeting}
      />

      <Modal
        type="bottom"
        isOpen={activeModal === 'actionSheet'}
        onClose={closeModal}
        actions={[
          { label: '모임 신고하기', onClick: () => { closeModal(); openModal('report'); } },
          { label: '모임 탈퇴하기', onClick: () => { closeModal(); openModal('leaveMeeting'); }, variant: 'danger' },
        ]}
      />

      <Modal
        isOpen={activeModal === 'report'}
        onClose={closeModal}
        title="모임 신고"
        message="신고 사유를 작성해주세요."
        showInput
        inputPlaceholder="신고 내용을 입력해주세요"
        inputValue={reportContent}
        onInputChange={setReportContent}
        confirmText="신고"
        cancelText="취소"
        onConfirm={handleReportMeeting}
      />

      <Modal
        isOpen={activeModal === 'leaveMeeting'}
        onClose={closeModal}
        message="모임에서 탈퇴하시겠습니까?"
        showCheckbox
        checkboxLabel="탈퇴에 동의합니다"
        confirmText="탈퇴"
        cancelText="취소"
        onConfirm={handleLeaveMeeting}
      />

      <Modal
        isOpen={activeModal === 'cancelParticipation'}
        onClose={closeModal}
        message={`"${selectedEvent?.title}" 정모 참석을 취소하시겠습니까?`}
        confirmText="취소"
        cancelText="닫기"
        onConfirm={handleCancelParticipation}
      />

      <Modal
        isOpen={activeModal === 'joinEvent'}
        onClose={closeModal}
        message={`"${selectedEvent?.title}" 정모에 참여하시겠습니까?`}
        confirmText="참여"
        cancelText="취소"
        onConfirm={handleJoinEvent}
      />

      <Modal
        isOpen={activeModal === 'joinMeetingFirst'}
        onClose={closeModal}
        message="모임에 먼저 가입 후 참석할 수 있습니다."
        confirmText="확인"
        singleButton
        onConfirm={closeModal}
      />
    </div>
  );
};

export default MeetingDetailPage;
