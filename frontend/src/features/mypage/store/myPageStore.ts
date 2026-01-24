import { create } from 'zustand';
import type { UserProfile } from '@/shared/types/User.types';

// Mock 초기 데이터
const MOCK_USER: UserProfile = {
  userId: '1',
  email: 'user@example.com',
  nickname: '김구름',
  bio: '맛집 탐방을 좋아하는 사람입니다.',
  profileImage: undefined,
  location: { lat: 37.5665, lng: 126.978, region: '성수동' },
  interests: ['맛집 탐방'],
  provider: 'KAKAO',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

interface MyPageState {
  user: UserProfile | null;
  isInitialized: boolean;

  // 초기화
  initializeMockData: () => void;

  // 유저 관리
  setUser: (user: UserProfile) => void;
  updateUser: (data: Partial<UserProfile>) => void;
  clearUser: () => void;
}

export const useMyPageStore = create<MyPageState>((set, get) => ({
  user: null,
  isInitialized: false,

  initializeMockData: () => {
    if (!get().isInitialized) {
      set({
        user: MOCK_USER,
        isInitialized: true,
      });
    }
  },

  setUser: (user) => set({ user }),

  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data, updatedAt: new Date().toISOString() } : null,
    })),

  clearUser: () =>
    set({
      user: null,
      isInitialized: false,
    }),
}));
