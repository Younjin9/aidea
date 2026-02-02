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
import RequiredInfoPage from '../features/onboarding/components/RequiredInfoPage';
import ShortsPage from '@/features/recommendation/components/ShortsPage';
import MeetingListPage from '@/features/meeting/components/MeetingListPage';
import MeetingCreatePage from '@/features/meeting/components/MeetingCreatePage';
import MeetingDetailPage from '@/features/meeting/components/detail';
import MeetingSearchPage from '@/features/meeting/components/MeetingSearchPage';
import MemberManagePage from '@/features/meeting/components/MemberManagePage';
import EventCreatePage from '@/features/meeting/components/EventCreatePage';
import EventEditPage from '@/features/meeting/components/EventEditPage';
import EventLinkExpiredPage from '@/features/meeting/components/EventLinkExpiredPage';
import ChatRoomPage from '@/features/chat/components/ChatRoomPage';
import MyPageView from '@/features/mypage/components/MyPageView';
import ProfileEditPage from '@/features/mypage/components/ProfileEditPage';
import MyMeetingsPage from '@/features/mypage/components/MyMeetingsPage';
import NotificationPage from '@/features/notification/components/NotificationPage';
import { useAuthStore } from '@/features/auth/store/authStore';
// BottomTab import removed as it causes error and PrivateRoute uses Outlet
// import BottomTab from '@/shared/components/layout/BottomTab';

// 페이지 이동 시 스크롤을 맨 위로 이동
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const PrivateRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const hasRequiredInfo = user?.gender && user?.location;
  const hasInterests = user?.interests && user.interests.length > 0;

  // 1. 필수 정보(성별/지역)가 없으면 -> /onboarding/required-info로 리다이렉트
  if (!hasRequiredInfo && location.pathname !== '/onboarding/required-info') {
    return <Navigate to="/onboarding/required-info" replace />;
  }

  // 2. 필수 정보는 있는데 관심사가 없으면 -> /onboarding/interest로 리다이렉트
  //    (단, 현재 경로가 interest라면 루프 방지)
  //    (required-info 페이지에서는 관심사 체크 건너뜀)
  if (hasRequiredInfo && !hasInterests && location.pathname !== '/onboarding/interest' && location.pathname !== '/onboarding/required-info') {
    return <Navigate to="/onboarding/interest" replace />;
  }

  return <Outlet />;
};

const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const hasInterests = !!user?.interests && user.interests.length > 0;
  return hasInterests ? <Navigate to="/shorts" replace /> : <Navigate to="/onboarding/interest" replace />;
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
          <Route path="/onboarding/required-info" element={<RequiredInfoPage />} />
          <Route path="/onboarding/interest" element={<InterestPage />} />

          {/* Share Routes */}
          <Route path="/events/expired" element={<EventLinkExpiredPage />} />
          
          <Route path="/chat" element={<ChatRoomPage />} />
        </Route>

        {/* Main App Routes (With Bottom Navigation) */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/shorts" element={<ShortsPage />} />
            <Route path="/short" element={<Navigate to="/shorts" replace />} />
            <Route path="/meetings" element={<MeetingListPage />} />
            <Route path="/chat/:meetingId" element={<ChatRoomPage />} />
            <Route path="/mypage" element={<MyPageView />} />
          </Route>
        </Route>

        {/* Meeting & MyPage Routes (No Bottom Navigation) */}
        <Route element={<PrivateRoute />}>
          <Route element={<MobileLayout />}>
            <Route path="/onboarding/interest" element={<InterestPage />} />
            <Route path="/search" element={<MeetingSearchPage />} />
            <Route path="/meetings/create" element={<MeetingCreatePage />} />
            <Route path="/meetings/:meetingId" element={<MeetingDetailPage />} />
            <Route path="/meetings/:meetingId/members" element={<MemberManagePage />} />
            <Route path="/meetings/:meetingId/events/create" element={<EventCreatePage />} />
            <Route path="/meetings/:meetingId/events/:eventId/edit" element={<EventEditPage />} />
            
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/mypage/edit" element={<ProfileEditPage />} />
            <Route path="/my-meetings" element={<MyMeetingsPage />} />
          </Route>
        </Route>
          
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 - Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
