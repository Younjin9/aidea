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
      isAuthenticated: true,
      accessToken: null,
      setAuth: (user, token) => {
        set({ user, accessToken: token, isAuthenticated: true });
      },
      updateUser: (user) => set({ user }),
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
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
