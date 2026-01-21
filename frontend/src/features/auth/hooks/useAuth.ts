import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    logout,
  };
};
