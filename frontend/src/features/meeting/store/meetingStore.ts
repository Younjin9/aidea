import { create } from 'zustand';
import type { MeetingUI } from '@/shared/types/Meeting.types';

// Mock 초기 데이터
const MOCK_MEETINGS: MeetingUI[] = [
  { id: 1, groupId: '1', image: 'https://i.pinimg.com/736x/44/e7/7e/44e77e3a2d34a147afc6a384ebd7a42f.jpg', title: '맛집 탐방', category: '맛집 탐방', location: '성수동', members: 5, isLiked: false },
  { id: 2, groupId: '2', image: 'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg', title: '러닝 크루', category: '운동/스포츠', location: '한강공원', members: 12, isLiked: true },
  { id: 3, groupId: '3', image: 'https://i.pinimg.com/736x/5b/f9/cd/5bf9cd89c1a2a48c2e7e0e1b13b82d2a.jpg', title: '독서 모임', category: '문화/예술', location: '홍대', members: 8, isLiked: false },
];

interface MeetingState {
  meetings: MeetingUI[];
  isInitialized: boolean;
  initializeMockData: () => void;
  setMeetings: (meetings: MeetingUI[]) => void;
  addMeeting: (meeting: Omit<MeetingUI, 'id'>) => MeetingUI;
  getMeetingById: (id: number) => MeetingUI | undefined;
  getMeetingByGroupId: (groupId: string) => MeetingUI | undefined;
  toggleLike: (id: number) => void;
  toggleLikeByGroupId: (groupId: string) => void;
  groupByCategory: () => Record<string, MeetingUI[]>;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  isInitialized: false,

  initializeMockData: () => {
    if (!get().isInitialized) {
      set({ meetings: MOCK_MEETINGS, isInitialized: true });
    }
  },

  setMeetings: (meetings) => set({ meetings }),

  addMeeting: (meeting) => {
    const newId = Math.max(0, ...get().meetings.map((m) => m.id)) + 1;
    const newGroupId = String(Date.now());
    const newMeeting: MeetingUI = { ...meeting, id: newId, groupId: meeting.groupId || newGroupId };
    set((state) => ({ meetings: [newMeeting, ...state.meetings] }));
    return newMeeting;
  },

  getMeetingById: (id) => get().meetings.find((m) => m.id === id),
  getMeetingByGroupId: (groupId) => get().meetings.find((m) => m.groupId === groupId),

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
}));