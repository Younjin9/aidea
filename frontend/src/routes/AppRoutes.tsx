import React, { useEffect } from 'react';
import { Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import MobileLayout from '@/shared/components/layout/MobileLayout';
import MainLayout from '@/shared/components/layout/MainLayout';
import LoginPage from '@/features/auth/components/LoginPage';
import EmailLoginPage from '@/features/auth/components/EmailLoginPage';
import SignupPage from '@/features/auth/components/SignupPage';
import SignupCompletePage from '@/features/auth/components/SignupCompletePage';
import OAuthCallbackPage from '@/features/auth/components/OAuthCallbackPage';
import FindIdPage from '@/features/auth/components/FindIdPage';
import FindPwPage from '@/features/auth/components/FindPwPage';
import InterestPage from '@/features/onboarding/components/InterestPage';
import ShortsPage from '@/features/recommendation/components/ShortsPage';
import MeetingListPage from '@/features/meeting/components/MeetingListPage';
import MeetingCreatePage from '@/features/meeting/components/MeetingCreatePage';
import MeetingDetailPage from '@/features/meeting/components/detail';
import MeetingSearchPage from '@/features/meeting/components/MeetingSearchPage';
import MemberManagePage from '@/features/meeting/components/MemberManagePage';
import EventCreatePage from '@/features/meeting/components/EventCreatePage';
import EventEditPage from '@/features/meeting/components/EventEditPage';
import ChatRoomPage from '@/features/chat/components/ChatRoomPage';
import MyPageView from '@/features/mypage/components/MyPageView';
import ProfileEditPage from '@/features/mypage/components/ProfileEditPage';
import MyMeetingsPage from '@/features/mypage/components/MyMeetingsPage';
import { useAuthStore } from '@/features/auth/store/authStore';

// 페이지 이동 시 스크롤을 맨 위로 이동
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const PrivateRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? <Outlet /> : <Navigate to="/shorts" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MobileLayout />}>
          {/* Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/email" element={<EmailLoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signup/complete" element={<SignupCompletePage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
            <Route path="/find-id" element={<FindIdPage />} />
            <Route path="/find-pw" element={<FindPwPage />} />
          </Route>
          
          {/* Onboarding Routes */}
          <Route path="/onboarding/interest" element={<InterestPage />} />
          <Route path="/chat" element={<ChatRoomPage />} />
        </Route>

        {/* Main App Routes (With Bottom Navigation) */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/shorts" element={<ShortsPage />} />
            <Route path="/meetings" element={<MeetingListPage />} />
            <Route path="/chat/:meetingId" element={<ChatRoomPage />} />
            <Route path="/mypage" element={<MyPageView />} />
          </Route>
        </Route>

        {/* Meeting & MyPage Routes (No Bottom Navigation) */}
        <Route element={<PrivateRoute />}>
          <Route element={<MobileLayout />}>
            <Route path="/search" element={<MeetingSearchPage />} />
            <Route path="/meetings/create" element={<MeetingCreatePage />} />
            <Route path="/meetings/:meetingId" element={<MeetingDetailPage />} />
            <Route path="/meetings/:meetingId/members" element={<MemberManagePage />} />
            <Route path="/meetings/:meetingId/events/create" element={<EventCreatePage />} />
            <Route path="/meetings/:meetingId/events/:eventId/edit" element={<EventEditPage />} />
            
            <Route path="/mypage/edit" element={<ProfileEditPage />} />
            <Route path="/my-meetings" element={<MyMeetingsPage />} />
          </Route>
        </Route>
          
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
