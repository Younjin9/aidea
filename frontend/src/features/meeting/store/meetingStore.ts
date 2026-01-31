import { create } from 'zustand';
import type { MeetingUI, MeetingEvent } from '@/shared/types/Meeting.types';

// Mock 초기 데이터 - myStatus, myRole 포함
// Mock 이벤트 데이터
export const MOCK_EVENTS: Record<string, MeetingEvent[]> = {
  1: [{
    eventId: 1,
    title: '성수 맛집 탐방',
    date: '2025-02-15',
    scheduledAt: '2025-02-15 14:00',
    location: '성수역 2번 출구',
    cost: 0,
    maxParticipants: 10,
    participantCount: 2,
    participants: [
      { memberId: 1, userId: 1, nickname: '김구름', profileImage: undefined, role: 'HOST', status: 'APPROVED', joinedAt: '2024-01-20' },
      { memberId: 2, userId: 2, nickname: '김구름2', profileImage: undefined, role: 'MEMBER', status: 'APPROVED', joinedAt: '2024-01-20' },
    ],
  }],
  2: [],
  3: [{
    eventId: 2,
    title: '이번 달 독서 모임',
    date: '2025-02-20',
    scheduledAt: '2025-02-20 19:00',
    location: '홍대 카페',
    cost: 0,
    maxParticipants: 8,
    participantCount: 1,
    participants: [
      { memberId: 3, userId: 1, nickname: '김구름', profileImage: undefined, role: 'HOST', status: 'APPROVED', joinedAt: '2024-01-20' },
    ],
  }],
};

const MOCK_MEETINGS: MeetingUI[] = [
  {
    id: 1,
    groupId: '1',
    image: 'https://i.pinimg.com/736x/44/e7/7e/44e77e3a2d34a147afc6a384ebd7a42f.jpg',
    title: '맛집 탐방',
    category: '맛집 탐방',
    location: '성수동',
    members: 5,
    maxMembers: 10,
    description: '우리와 함께 맛집을 탐방해보세요.',
    isLiked: false,
    ownerUserId: 1,
    myStatus: 'APPROVED',
    myRole: 'HOST',
  },
  {
    id: 2,
    groupId: '2',
    image: 'https://img.gqkorea.co.kr/gq/2023/04/style_644b60baa384e.jpg',
    title: '러닝 크루',
    category: '운동/스포츠',
    location: '한강공원',
    members: 12,
    maxMembers: 20,
    description: '함께 달려요!',
    isLiked: true,
    ownerUserId: 2,
    myStatus: undefined, // 미가입
    myRole: undefined,
  },
  {
    id: 3,
    groupId: '3',
    image: 'https://www.smalllibrary.org/contents/2019/12/04/a91a586f-9a45-4be7-8577-b6f1aededa57.JPG',
    title: '독서 모임',
    category: '문화/예술',
    location: '홍대',
    members: 8,
    maxMembers: 15,
    description: '함께 책을 읽어요.',
    isLiked: false,
    ownerUserId: 1,
    myStatus: 'APPROVED',
    myRole: 'HOST',
  },
];

interface MeetingState {
  meetings: MeetingUI[];
  events: Record<string, MeetingEvent[]>; // groupId별 이벤트 목록
  isInitialized: boolean;

  // 초기화
  initializeMockData: () => void;
  setMeetings: (meetings: MeetingUI[]) => void;

  // CRUD
  addMeeting: (meeting: Omit<MeetingUI, 'id'>) => MeetingUI;
  updateMeeting: (groupId: string, updates: Partial<MeetingUI>) => void;

  // 조회
  getMeetingById: (id: number) => MeetingUI | undefined;
  getMeetingByGroupId: (groupId: string) => MeetingUI | undefined;
  getMyMeetings: () => MeetingUI[];
  getLikedMeetings: () => MeetingUI[];

  // 좋아요
  toggleLike: (id: number) => void;
  toggleLikeByGroupId: (groupId: string) => void;

  // 가입/탈퇴
  joinMeeting: (groupId: string, role?: 'HOST' | 'MEMBER') => void;
  leaveMeeting: (groupId: string) => void;

  // 삭제
  removeMeeting: (groupId: string) => void;

  // 그룹핑
  groupByCategory: () => Record<string, MeetingUI[]>;

  // 이벤트 관련
  getEventsByGroupId: (groupId: string) => MeetingEvent[];
  addEvent: (groupId: string, event: MeetingEvent) => void;
  updateEvent: (groupId: string, eventId: string, updates: Partial<MeetingEvent>) => void;
  deleteEvent: (groupId: string, eventId: string) => void;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  events: {},
  isInitialized: false,

  initializeMockData: () => {
    if (!get().isInitialized) {
      set({ meetings: MOCK_MEETINGS, events: MOCK_EVENTS, isInitialized: true });
    }
  },

  setMeetings: (meetings) => set({ meetings }),

  addMeeting: (meeting) => {
    const newId = Math.max(0, ...get().meetings.map((m) => m.id)) + 1;
    const newGroupId = String(Date.now());
    const newMeeting: MeetingUI = {
      ...meeting,
      id: newId,
      groupId: meeting.groupId || newGroupId,
    };
    set((state) => ({ meetings: [newMeeting, ...state.meetings] }));
    return newMeeting;
  },

  updateMeeting: (groupId, updates) =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.groupId === groupId ? { ...m, ...updates } : m
      ),
    })),

  getMeetingById: (id) => get().meetings.find((m) => m.id === id),

  getMeetingByGroupId: (groupId) => get().meetings.find((m) => m.groupId === groupId),

  // 내가 가입한 모임 (myStatus가 APPROVED인 것)
  getMyMeetings: () => get().meetings.filter((m) => m.myStatus === 'APPROVED'),

  // 찜한 모임 (isLiked가 true인 것)
  getLikedMeetings: () => get().meetings.filter((m) => m.isLiked),

  toggleLike: (id) =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === id ? { ...m, isLiked: !m.isLiked } : m
      ),
    })),

  toggleLikeByGroupId: (groupId) =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.groupId === groupId ? { ...m, isLiked: !m.isLiked } : m
      ),
    })),

  joinMeeting: (groupId, role = 'MEMBER') =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.groupId === groupId
          ? { ...m, myStatus: 'APPROVED' as const, myRole: role, members: m.members + 1 }
          : m
      ),
    })),

  leaveMeeting: (groupId) =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.groupId === groupId
          ? { ...m, myStatus: undefined, myRole: undefined, members: Math.max(0, m.members - 1) }
          : m
      ),
    })),

  removeMeeting: (groupId) =>
    set((state) => ({
      meetings: state.meetings.filter((m) => m.groupId !== groupId),
    })),

  groupByCategory: () => {
    const meetings = get().meetings;
    return meetings.reduce(
      (acc, m) => {
        if (!acc[m.category]) acc[m.category] = [];
        acc[m.category].push(m);
        return acc;
      },
      {} as Record<string, MeetingUI[]>
    );
  },

  // 이벤트 관련
  getEventsByGroupId: (groupId) => get().events[groupId] || [],

  addEvent: (groupId, event) =>
    set((state) => ({
      events: {
        ...state.events,
        [groupId]: [...(state.events[groupId] || []), event],
      },
    })),

  updateEvent: (groupId, eventId, updates) =>
    set((state) => ({
      events: {
        ...state.events,
        [groupId]: (state.events[groupId] || []).map((e) =>
          e.eventId === eventId ? { ...e, ...updates } : e
        ),
      },
    })),

  deleteEvent: (groupId, eventId) =>
    set((state) => ({
      events: {
        ...state.events,
        [groupId]: (state.events[groupId] || []).filter((e) => e.eventId !== eventId),
      },
    })),
}));
