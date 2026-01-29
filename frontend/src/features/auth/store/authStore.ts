import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/shared/types/User.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      setAuth: (user, token) => {
        // 1. localStorage에서 이전 사용자 정보 완전 제거
        localStorage.removeItem('auth-storage-v2');
        // 2. 새로운 사용자 정보로 업데이트
        localStorage.setItem('accessToken', token);
        set({ 
          user: { ...user },
          accessToken: token, 
          isAuthenticated: true 
        });
      },
      updateUser: (user) => set({ user }),
      logout: () => {
        // 상태 초기화 후 localStorage 완전 제거
        set({ user: null, accessToken: null, isAuthenticated: false });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth-storage-v2');
      },
    }),
    {
      name: 'auth-storage-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken
      }),
    }
  )
);

