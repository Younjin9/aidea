import { create } from 'zustand';

interface User {
  nickname: string;
  profileImage: string;
  bio: string;
  interests: string[];
}

interface Meeting {
  id: number;
  image: string;
  title: string;
  category: string;
  location: string;
  members: number;
  date: string;
}

interface MyPageState {
  user: User | null;
  myMeetings: Meeting[];
  likedMeetings: Meeting[];
  setUser: (user: User) => void;
  setMyMeetings: (meetings: Meeting[]) => void;
  setLikedMeetings: (meetings: Meeting[]) => void;
  unlikeMeeting: (id: number) => void;
}

export const useMyPageStore = create<MyPageState>((set) => ({
  user: null,
  myMeetings: [],
  likedMeetings: [],
  
  setUser: (user) => set({ user }),
  
  setMyMeetings: (meetings) => set({ myMeetings: meetings }),
  
  setLikedMeetings: (meetings) => set({ likedMeetings: meetings }),
  
  unlikeMeeting: (id) =>
    set((state) => ({
      likedMeetings: state.likedMeetings.filter((meeting) => meeting.id !== id),
    })),
}));