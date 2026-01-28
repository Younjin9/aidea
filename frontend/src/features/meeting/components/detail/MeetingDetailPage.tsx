// 모임 상세 페이지 - 코드 정리 버전
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import ProfileImage from '@/shared/components/ui/ProfileImage';
import Button from '@/shared/components/ui/Button';
import Modal from '@/shared/components/ui/Modal';
import DetailHeader from './DetailHeader';
import MeetingInfoSection from './MeetingInfoSection';
import EventSection from './EventSection';
import MemberSection from './MemberSection';
import { reportUser } from '@/shared/api/safety/safetyApi';
import ChatRoomPage from '@/features/chat/components/ChatRoomPage';
import meetingApi from '@/shared/api/meeting/meetingApi';
import { useMeetingStore } from '../../store/meetingStore';
import { useMyPageStore } from '@/features/mypage/store/myPageStore';
import { useJoinMeeting, useLeaveMeeting } from '../../hooks/useMeetings';
import { useJoinEvent, useCancelEventParticipation } from '../../hooks/useEvents';
import type { MeetingDetail, MeetingEvent } from '@/shared/types/Meeting.types';


// ============================================
// Types & Constants
// ============================================

type ModalType = 'profile' | 'greeting' | 'cancelParticipation' | 'joinEvent' | 'joinMeetingFirst' | null;

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
  myStatus: 'APPROVED',
};

const createMeetingDetailFromStore = (
  storedMeeting: { id: number; title: string; description?: string; image: string; category: string; members: number; maxMembers?: number; location: string; ownerUserId?: string | number; myStatus?: 'PENDING' | 'APPROVED'; myRole?: 'HOST' | 'MEMBER' },
  isOwner: boolean,
  user: { userId: string; nickname: string; profileImage?: string } | null,
  existingEvents: MeetingEvent[] = []
): MeetingDetail => {
  const hostUserId = String(storedMeeting.ownerUserId || 'user1');
  const hostNickname = isOwner ? (user?.nickname || '방장') : '모임장';
  const hostProfileImage = isOwner ? user?.profileImage : undefined;

  return {
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
    events: existingEvents,
    myRole: storedMeeting.myRole === 'MEMBER' ? 'USER' : storedMeeting.myRole || (isOwner ? 'HOST' : undefined),
    myStatus: storedMeeting.myStatus,
  };
};

// ============================================
// UI Components (분리된 컴포넌트들)
// ============================================


// ============================================
// Main Component
// ============================================

const MeetingDetailPage: React.FC = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { newEvent?: MeetingEvent; updatedEvent?: MeetingEvent; deletedEventId?: string; updatedMembers?: MeetingDetail['members'] } | null;

  const { getMeetingByGroupId, toggleLikeByGroupId, joinMeeting, leaveMeeting, getEventsByGroupId, addEvent, updateEvent: updateEventInStore, deleteEvent: deleteEventInStore, initializeMockData: initializeMeetingMockData, isInitialized: isMeetingInitialized } = useMeetingStore();
  const { user, initializeMockData: initializeUserMockData, isInitialized: isUserInitialized } = useMyPageStore();
  const { mutate: joinMeetingApi, isPending: isJoining } = useJoinMeeting();
  const { mutate: leaveMeetingApi } = useLeaveMeeting();
  const { mutate: joinEventApi } = useJoinEvent(meetingId || '');
  const { mutate: cancelEventApi } = useCancelEventParticipation(meetingId || '');

  const { data: apiMeetingDetail, isLoading, error } = useQuery({
    queryKey: ['meeting', 'detail', meetingId],
    queryFn: async () => { const response = await meetingApi.getDetail(meetingId || ''); return response.data; },
    enabled: !!meetingId, staleTime: 1000 * 60 * 3, retry: 1,
  });

  if (!isMeetingInitialized) initializeMeetingMockData();
  if (!isUserInitialized) initializeUserMockData();

  const storedMeeting = getMeetingByGroupId(meetingId || '');
  const isOwner = storedMeeting?.myRole === 'HOST' || (storedMeeting?.myRole === undefined && storedMeeting?.ownerUserId === user?.userId);

  const [activeTab, setActiveTab] = useState<'home' | 'chat'>('home');
  const [isLiked, setIsLiked] = useState(storedMeeting?.isLiked || false);
  const [greeting, setGreeting] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string } | null>(null);

  const storedEvents = getEventsByGroupId(meetingId || '');
  const [meeting, setMeeting] = useState<MeetingDetail>(() => {
    const events = storedEvents.length > 0 ? storedEvents : [];
    let baseMeeting: MeetingDetail;
    if (storedMeeting) {
      baseMeeting = createMeetingDetailFromStore(storedMeeting, isOwner, user, events);
    } else {
      baseMeeting = { ...MOCK_MEETING_DETAIL, events };
    }
    return baseMeeting;
  });

  useEffect(() => {
    if (!locationState || !meetingId) return;
    window.history.replaceState({}, document.title);
    if (locationState.newEvent) {
      const exists = getEventsByGroupId(meetingId).some(e => e.eventId === locationState.newEvent!.eventId);
      if (!exists) addEvent(meetingId, locationState.newEvent);
      setMeeting(prev => {
        const localExists = prev.events.some(e => e.eventId === locationState.newEvent!.eventId);
        if (localExists) return prev;
        return { ...prev, events: [...prev.events, locationState.newEvent!] };
      });
    }
    if (locationState.updatedMembers) {
      setMeeting(prev => ({
        ...prev,
        members: locationState.updatedMembers!,
        memberCount: locationState.updatedMembers!.filter(m => m.status === 'APPROVED').length,
      }));
    }
    if (locationState.updatedEvent) {
      updateEventInStore(meetingId, locationState.updatedEvent.eventId, locationState.updatedEvent);
      setMeeting(prev => ({
        ...prev,
        events: prev.events.map(e => e.eventId === locationState.updatedEvent!.eventId ? locationState.updatedEvent! : e),
      }));
    }
    if (locationState.deletedEventId) {
      deleteEventInStore(meetingId, locationState.deletedEventId);
      setMeeting(prev => ({
        ...prev,
        events: prev.events.filter(e => e.eventId !== locationState.deletedEventId),
      }));
    }
  }, [locationState, meetingId, getEventsByGroupId, addEvent, updateEventInStore, deleteEventInStore]);

  useEffect(() => {
    if (storedEvents.length > 0) {
      setMeeting(prev => ({ ...prev, events: storedEvents }));
    }
  }, [storedEvents]);

  useEffect(() => {
    if (apiMeetingDetail) {
      setMeeting(apiMeetingDetail);
    } else if (error) {
      console.warn('모임 상세 API 호출 실패, Mock 데이터 사용:', error);
    }
  }, [apiMeetingDetail, error]);

  const isHost = meeting.myRole === 'HOST';
  const isMember = meeting.myStatus === 'APPROVED';
  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => {
    setActiveModal(null);
    if (activeModal === 'cancelParticipation' || activeModal === 'joinEvent') setSelectedEvent(null);
  };

  const handleLikeToggle = () => {
    setIsLiked(prev => !prev);
    if (meetingId) toggleLikeByGroupId(meetingId);
  };

  const handleCancelParticipation = () => {
    if (!selectedEvent || !user) return;
    cancelEventApi(selectedEvent.id, {
      onSuccess: () => {
        setMeeting(prev => ({
          ...prev,
          events: prev.events.map(e =>
            e.eventId === selectedEvent.id
              ? { ...e, participantCount: Math.max(0, e.participantCount - 1), participants: (e.participants || []).filter(p => p.userId !== user.userId) }
              : e
          ),
        }));
        closeModal();
      },
      onError: () => {
        setMeeting(prev => ({
          ...prev,
          events: prev.events.map(e =>
            e.eventId === selectedEvent.id
              ? { ...e, participantCount: Math.max(0, e.participantCount - 1), participants: (e.participants || []).filter(p => p.userId !== user.userId) }
              : e
          ),
        }));
        closeModal();
      },
    });
  };

  const handleJoinEvent = () => {
    if (!selectedEvent || !user) return;
    joinEventApi(selectedEvent.id, {
      onSuccess: () => {
        setMeeting(prev => ({
          ...prev,
          events: prev.events.map(e =>
            e.eventId === selectedEvent.id
              ? { ...e, participantCount: e.participantCount + 1, participants: [...(e.participants || []), { userId: user.userId, nickname: user.nickname, profileImage: user.profileImage, isHost: isHost }] }
              : e
          ),
        }));
        closeModal();
      },
      onError: () => {
        setMeeting(prev => ({
          ...prev,
          events: prev.events.map(e =>
            e.eventId === selectedEvent.id
              ? { ...e, participantCount: e.participantCount + 1, participants: [...(e.participants || []), { userId: user.userId, nickname: user.nickname, profileImage: user.profileImage, isHost: isHost }] }
              : e
          ),
        }));
        closeModal();
      },
    });
  };

  const handleJoinClick = () => openModal(user?.profileImage ? 'greeting' : 'profile');

  const handleJoinMeeting = () => {
    if (!user || !meetingId) return;
    joinMeetingApi(
      { groupId: meetingId, requestMessage: greeting },
      {
        onSuccess: () => {
          setMeeting(prev => ({
            ...prev,
            memberCount: prev.memberCount + 1,
            members: [...prev.members, { userId: user.userId, nickname: user.nickname, profileImage: user.profileImage, role: 'MEMBER', status: 'APPROVED', joinedAt: new Date().toISOString() }],
            myStatus: 'APPROVED',
          }));
          setGreeting('');
          closeModal();
        },
        onError: () => {
          setMeeting(prev => ({
            ...prev,
            memberCount: prev.memberCount + 1,
            members: [...prev.members, { userId: user.userId, nickname: user.nickname, profileImage: user.profileImage, role: 'MEMBER', status: 'APPROVED', joinedAt: new Date().toISOString() }],
            myStatus: 'APPROVED',
          }));
          if (meetingId) joinMeeting(meetingId, 'MEMBER');
          setGreeting('');
          closeModal();
        },
      }
    );
  };

  const handleConfirmReport = async (content: string) => {
    try {
      await reportUser({
        targetUserId: meeting.ownerUserId,
        reason: 'ABUSE',
        detail: content,
      });
      alert('신고가 접수되었습니다.');
    } catch (error) {
      console.warn('신고 API 호출 실패 (fallback):', error);
      alert('신고가 접수되었습니다.');
    }
  };

  const handleLeaveMeeting = () => {
    if (!user || !meetingId) return;
    leaveMeetingApi(meetingId, {
      onSuccess: () => closeModal(),
      onError: () => {
        setMeeting(prev => ({
          ...prev,
          memberCount: prev.memberCount - 1,
          members: prev.members.filter(m => m.userId !== user.userId),
          myStatus: undefined,
        }));
        leaveMeeting(meeting.groupId);
        closeModal();
        navigate('/meetings');
      },
    });
  };

  const handleEventTitleClick = (event: MeetingEvent) => {
    navigate(`/meetings/${meetingId}/events/${event.eventId}/edit`, { state: { event } });
  };

  const handleEventAction = (eventId: string, title: string, action: 'cancelParticipation' | 'join') => {
    setSelectedEvent({ id: eventId, title });
    openModal(action === 'cancelParticipation' ? 'cancelParticipation' : 'joinEvent');
  };

  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="mt-4 text-gray-500 text-sm">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <DetailHeader
        title={meeting.title}
        isLiked={isLiked}
        activeTab={activeTab}
        onLikeToggle={handleLikeToggle}
        onTabChange={setActiveTab}
        isMember={!!isMember}
        onConfirmReport={handleConfirmReport}
        onConfirmLeave={handleLeaveMeeting}
      />

      <main className={`flex-1 flex flex-col relative ${activeTab === 'home' ? 'overflow-y-auto pb-20' : 'overflow-hidden pb-0'}`}>
        {activeTab === 'home' ? (
          <>
            <MeetingInfoSection meeting={meeting} />
            <EventSection
              events={meeting.events}
              meeting={meeting}
              isHost={isHost}
              isMember={isMember}
              userId={user?.userId}
              onEventTitleClick={handleEventTitleClick}
              onEventAction={handleEventAction}
              onJoinMeetingFirst={() => openModal('joinMeetingFirst')}
              onCreateEvent={() => navigate(`/meetings/${meetingId}/events/create`)}
              showCancelModal={activeModal === 'cancelParticipation'}
              showJoinEventModal={activeModal === 'joinEvent'}
              showJoinMeetingFirstModal={activeModal === 'joinMeetingFirst'}
              selectedEventTitle={selectedEvent?.title}
              onCloseCancelModal={closeModal}
              onCloseJoinEventModal={closeModal}
              onCloseJoinMeetingFirstModal={closeModal}
              onConfirmCancel={handleCancelParticipation}
              onConfirmJoin={handleJoinEvent}
            />
            <MemberSection
              members={meeting.members}
              isHost={isHost}
              onManage={() => navigate(`/meetings/${meetingId}/members`, { state: { members: meeting.members } })}
            />
          </>
        ) : (
          <ChatRoomPage />
        )}
      </main>

      {!isHost && !isMember && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[398px] px-4">
          <Button variant="primary" size="md" fullWidth onClick={handleJoinClick} disabled={isJoining}>
            {isJoining ? '가입 중...' : '참석하기'}
          </Button>
        </div>
      )}

      <Modal isOpen={activeModal === 'profile'} onClose={closeModal} message="프로필 사진을 등록해주세요." showLogo confirmText="OK" singleButton onConfirm={() => navigate('/mypage/edit')} />
      <Modal isOpen={activeModal === 'greeting'} onClose={closeModal} message="가입인사를 작성해주세요." image={<ProfileImage src={user?.profileImage} alt="프로필" size="md" />} showInput inputPlaceholder="가입인사를 작성해주세요!" inputValue={greeting} onInputChange={setGreeting} confirmText="확인" cancelText="취소" onConfirm={handleJoinMeeting} />

    </div>
  );
};

export default MeetingDetailPage;
