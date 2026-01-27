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
          localStorage.setItem('accessToken', token); // api.ts에서 참조
          set({ user, accessToken: token, isAuthenticated: true });
      },
      updateUser: (user) => set({ user }),
      logout: () => {
          localStorage.removeItem('accessToken');
          set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // 토큰은 따로 관리하거나 여기서 제외 및 별도 처리 가능. 여기서는 accessToken은 state에는 있지만 persist는 보안상 제외할 수도 있으나, 편의상 localStorage에 직접 setItem으로 동기화함.
    }
  )
);
