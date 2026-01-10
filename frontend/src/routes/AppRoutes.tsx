import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import MobileLayout from '@/shared/components/layout/MobileLayout';
import MainLayout from '@/shared/components/layout/MainLayout';
import LoginPage from '@/pages/auth/LoginPage';
import EmailLoginPage from '@/pages/auth/EmailLoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import FindIdPage from '@/pages/auth/FindIdPage';
import FindPwPage from '@/pages/auth/FindPwPage';
import InterestPage from '@/pages/onboarding/InterestPage';
import ShortsPage from '@/pages/recommendation/ShortsPage';
// import MeetingListPage from '@/features/meeting/MeetingListPage';
import MeetingListPage from '@/features/meeting/components/MeetingListPage';
import ChatListPage from '@/pages/chat/ChatListPage';
// import MyPage from '@/pages/mypage/MyPage';
import MyPage from '@/features/mypage/components/MyPageView';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MobileLayout />}>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/email" element={<EmailLoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
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
