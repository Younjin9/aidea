import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import MobileLayout from '@/shared/components/layout/MobileLayout';
import MainLayout from '@/shared/components/layout/MainLayout';
import LoginPage from '@/features/auth/components/LoginPage';
import EmailLoginPage from '@/features/auth/components/EmailLoginPage';
import SignupPage from '@/features/auth/components/SignupPage';
import SignupCompletePage from '@/features/auth/components/SignupCompletePage';
import FindIdPage from '@/features/auth/components/FindIdPage';
import FindPwPage from '@/features/auth/components/FindPwPage';
import InterestPage from '@/features/onboarding/components/InterestPage';
import ShortsPage from '@/features/recommendation/components/ShortsPage';
import MeetingListPage from '@/features/meeting/components/MeetingListPage';
import ChatListPage from '@/features/chat/components/ChatListPage';
import MyPage from '@/features/mypage/components/MyPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MobileLayout />}>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/email" element={<EmailLoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/complete" element={<SignupCompletePage />} />
        <Route path="/find-id" element={<FindIdPage />} />
        <Route path="/find-pw" element={<FindPwPage />} />
        
        {/* Onboarding Routes */}
        <Route path="/onboarding/interest" element={<InterestPage />} />
      </Route>

      {/* Main App Routes (With Bottom Navigation) */}
      <Route element={<MainLayout />}>
        <Route path="/shorts" element={<ShortsPage />} />
        <Route path="/meetings" element={<MeetingListPage />} />
        <Route path="/chat" element={<ChatListPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Route>
        
      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/shorts" replace />} />
    </Routes>
  );
};

export default AppRoutes;
