import { create } from 'zustand';
import type { UserProfile } from '@/shared/types/User.types';
import type { Meeting } from '@/shared/types/Meeting.types';

interface MyPageState {
  user: UserProfile | null;
  myMeetings: Meeting[];
  likedMeetings: Meeting[];
  setUser: (user: UserProfile) => void;
  setMyMeetings: (meetings: Meeting[]) => void;
  setLikedMeetings: (meetings: Meeting[]) => void;
  unlikeMeeting: (groupId: string) => void;
  clearAll: () => void;
}

export const useMyPageStore = create<MyPageState>((set) => ({
  user: null,
  myMeetings: [],
  likedMeetings: [],

  setUser: (user) => set({ user }),

  setMyMeetings: (meetings) => set({ myMeetings: meetings }),

  setLikedMeetings: (meetings) => set({ likedMeetings: meetings }),

  unlikeMeeting: (groupId) =>
    set((state) => ({
      likedMeetings: state.likedMeetings.filter((meeting) => meeting.groupId !== groupId),
    })),

  clearAll: () =>
    set({
      user: null,
      myMeetings: [],
      likedMeetings: [],
    }),
}));