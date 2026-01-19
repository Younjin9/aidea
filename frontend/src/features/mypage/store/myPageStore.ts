import { create } from 'zustand';
import type { UserProfile } from '@/shared/types/User.types';
import type { Meeting } from '@/shared/types/Meeting.types';

// Mock 초기 데이터
const MOCK_USER: UserProfile = {
  userId: 'user1',
  email: 'user@example.com',
  nickname: '김구름',
  bio: '맛집 탐방을 좋아하는 사람입니다.',
  profileImage: undefined,
  location: { lat: 37.5665, lng: 126.978, region: '성수동' },
  interests: ['맛집 탐방', '러닝'],
  provider: 'KAKAO',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const MOCK_MY_MEETINGS: Meeting[] = [
  {
    groupId: '1',
    title: '맛집 탐방',
    description: '우리와 함께 맛집을 탐방해보세요.',
    imageUrl: 'https://i.pinimg.com/736x/44/e7/7e/44e77e3a2d34a147afc6a384ebd7a42f.jpg',
    interestCategoryId: '1',
    interestCategoryName: '맛집 탐방',
    memberCount: 5,
    maxMembers: 10,
    location: { lat: 37.5665, lng: 126.978, region: '성수동' },
    isPublic: true,
    ownerUserId: 'user1',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    groupId: '4',
    title: '독서 모임',
    description: '함께 책을 읽어요.',
    imageUrl: 'https://i.pinimg.com/736x/5b/f9/cd/5bf9cd89c1a2a48c2e7e0e1b13b82d2a.jpg',
    interestCategoryId: '3',
    interestCategoryName: '문화/예술',
    memberCount: 8,
    maxMembers: 15,
    location: { lat: 37.5565, lng: 126.924, region: '홍대' },
    isPublic: true,
    ownerUserId: 'user1',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
  },
];

const MOCK_LIKED_MEETINGS: Meeting[] = [
  {
    groupId: '2',
    title: '러닝 크루',
    description: '함께 달려요!',
    imageUrl: 'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg',
    interestCategoryId: '2',
    interestCategoryName: '운동/스포츠',
    memberCount: 12,
    maxMembers: 20,
    location: { lat: 37.5170, lng: 127.0473, region: '한강공원' },
    isPublic: true,
    ownerUserId: 'user2',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    groupId: '5',
    title: '사진 동호회',
    description: '출사 함께해요!',
    imageUrl: 'https://i.pinimg.com/736x/a1/b2/c3/a1b2c3d4e5f6g7h8i9j0.jpg',
    interestCategoryId: '3',
    interestCategoryName: '문화/예술',
    memberCount: 6,
    maxMembers: 12,
    location: { lat: 37.5512, lng: 126.988, region: '명동' },
    isPublic: true,
    ownerUserId: 'user3',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  },
];

interface MyPageState {
  user: UserProfile | null;
  myMeetings: Meeting[];
  likedMeetings: Meeting[];
  isInitialized: boolean;
  initializeMockData: () => void;
  setUser: (user: UserProfile) => void;
  updateUser: (data: Partial<UserProfile>) => void;
  setMyMeetings: (meetings: Meeting[]) => void;
  setLikedMeetings: (meetings: Meeting[]) => void;
  addMyMeeting: (meeting: Meeting) => void;
  removeMyMeeting: (groupId: string) => void;
  toggleLikedMeeting: (meeting: Meeting) => void;
  unlikeMeeting: (groupId: string) => void;
  clearAll: () => void;
}

export const useMyPageStore = create<MyPageState>((set, get) => ({
  user: null,
  myMeetings: [],
  likedMeetings: [],
  isInitialized: false,

  initializeMockData: () => {
    if (!get().isInitialized) {
      set({
        user: MOCK_USER,
        myMeetings: MOCK_MY_MEETINGS,
        likedMeetings: MOCK_LIKED_MEETINGS,
        isInitialized: true,
      });
    }
  },

  setUser: (user) => set({ user }),

  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data, updatedAt: new Date().toISOString() } : null,
    })),

  setMyMeetings: (meetings) => set({ myMeetings: meetings }),

  setLikedMeetings: (meetings) => set({ likedMeetings: meetings }),

  addMyMeeting: (meeting) =>
    set((state) => ({
      myMeetings: [meeting, ...state.myMeetings],
    })),

  removeMyMeeting: (groupId) =>
    set((state) => ({
      myMeetings: state.myMeetings.filter((meeting) => meeting.groupId !== groupId),
    })),

  toggleLikedMeeting: (meeting) =>
    set((state) => {
      const isLiked = state.likedMeetings.some((m) => m.groupId === meeting.groupId);
      if (isLiked) {
        return { likedMeetings: state.likedMeetings.filter((m) => m.groupId !== meeting.groupId) };
      }
      return { likedMeetings: [meeting, ...state.likedMeetings] };
    }),

  unlikeMeeting: (groupId) =>
    set((state) => ({
      likedMeetings: state.likedMeetings.filter((meeting) => meeting.groupId !== groupId),
    })),

  clearAll: () =>
    set({
      user: null,
      myMeetings: [],
      likedMeetings: [],
      isInitialized: false,
    }),
}));