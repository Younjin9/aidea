import { create } from 'zustand';
import type { MeetingUI } from '@/shared/types/Meeting.types';

interface MeetingState {
  meetings: MeetingUI[];
  setMeetings: (meetings: MeetingUI[]) => void;
  toggleLike: (id: number) => void;
  groupByCategory: () => Record<string, MeetingUI[]>;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  
  setMeetings: (meetings) => set({ meetings }),
  
  toggleLike: (id) =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === id ? { ...m, isLiked: !m.isLiked } : m
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