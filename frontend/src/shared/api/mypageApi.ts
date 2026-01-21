import apiClient from './client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  User,
  UserProfile,
  UpdateProfileRequest,
  UpdateProfileImageResponse,
  MeetingStatusFilter,
  UserStats,
  UserReputation,
  NotificationSettings,
  UpdateNotificationSettingsRequest,
} from '@/shared/types/user.types';
import type { Meeting } from '@/shared/types/meeting.types';
import type { Review, WriteReviewRequest } from '@/shared/types/review.types';
import type { Report, ReportUserRequest, Block } from '@/shared/types/safety.types';
import type { Notification } from '@/shared/types/notification.types';

// ============================================
// 👤 MyPage API - 유경님
// 프로필 / 내 모임 / 리뷰 / 신고/차단 / 알림 통합
// ============================================

// ============================================
// 📍 프로필
// ============================================

/**
 * 내 프로필 조회
 * GET /api/users/me
 */
export const getMyProfile = async (): Promise<ApiResponse<UserProfile>> => {
  return apiClient.get('/users/me');
};

/**
 * 다른 사용자 프로필 조회
 * GET /api/users/{userId}
 */
export const getUserProfile = async (userId: string): Promise<ApiResponse<UserProfile>> => {
  return apiClient.get(`/users/${userId}`);
};

/**
 * 프로필 수정
 * PATCH /api/users/me
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
  return apiClient.patch('/users/me', data);
};

/**
 * 프로필 이미지 변경
 * POST /api/users/me/profile-image
 */
export const updateProfileImage = async (file: File): Promise<ApiResponse<UpdateProfileImageResponse>> => {
  const formData = new FormData();
  formData.append('image', file);
  
  return apiClient.post('/users/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * 프로필 이미지 삭제
 * DELETE /api/users/me/profile-image
 */
export const deleteProfileImage = async (): Promise<ApiResponse<void>> => {
  return apiClient.delete('/users/me/profile-image');
};

// ============================================
// 📍 내 모임
// ============================================

/**
 * 내가 참여 중인 모임 목록
 * GET /api/users/me/groups
 */
export const getMyMeetings = async (status: MeetingStatusFilter = 'active'): Promise<ApiResponse<Meeting[]>> => {
  return apiClient.get(`/users/me/groups?status=${status}`);
};

/**
 * 내가 호스트인 모임 목록
 * GET /api/users/me/groups/hosted
 */
export const getHostedMeetings = async (): Promise<ApiResponse<Meeting[]>> => {
  return apiClient.get('/users/me/groups/hosted');
};

/**
 * 내가 멤버인 모임 목록
 * GET /api/users/me/groups/joined
 */
export const getJoinedMeetings = async (): Promise<ApiResponse<Meeting[]>> => {
  return apiClient.get('/users/me/groups/joined');
};

/**
 * 가입 대기 중인 모임 목록
 * GET /api/users/me/groups/pending
 */
export const getPendingMeetings = async (): Promise<ApiResponse<Meeting[]>> => {
  return apiClient.get('/users/me/groups/pending');
};

/**
 * 내가 좋아요한 모임 목록
 * GET /api/users/me/liked-groups
 */
export const getLikedMeetings = async (): Promise<ApiResponse<Meeting[]>> => {
  return apiClient.get('/users/me/liked-groups');
};

// ============================================
// 📍 통계 & 신뢰도
// ============================================

/**
 * 내 활동 통계
 * GET /api/users/me/stats
 */
export const getMyStats = async (): Promise<ApiResponse<UserStats>> => {
  return apiClient.get('/users/me/stats');
};

/**
 * 내 신뢰도 조회
 * GET /api/users/me/reputation
 */
export const getMyReputation = async (): Promise<ApiResponse<UserReputation>> => {
  return apiClient.get('/users/me/reputation');
};

/**
 * 다른 사용자 신뢰도 조회
 * GET /api/users/{userId}/reputation
 */
export const getUserReputation = async (userId: string): Promise<ApiResponse<UserReputation>> => {
  return apiClient.get(`/users/${userId}/reputation`);
};

// ============================================
// 📍 리뷰
// ============================================

/**
 * 내가 받은 리뷰 목록
 * GET /api/reviews/me
 */
export const getMyReviews = async (): Promise<ApiResponse<Review[]>> => {
  return apiClient.get('/reviews/me');
};

/**
 * 내가 작성한 리뷰 목록
 * GET /api/reviews/me/written
 */
export const getMyWrittenReviews = async (): Promise<ApiResponse<Review[]>> => {
  return apiClient.get('/reviews/me/written');
};

/**
 * 리뷰 작성
 * POST /api/reviews
 */
export const writeReview = async (data: WriteReviewRequest): Promise<ApiResponse<Review>> => {
  return apiClient.post('/reviews', data);
};

// ============================================
// 📍 신고 & 차단
// ============================================

/**
 * 차단한 사용자 목록
 * GET /api/safety/blocks
 */
export const getBlocks = async (): Promise<ApiResponse<Block[]>> => {
  return apiClient.get('/safety/blocks');
};

/**
 * 사용자 차단
 * POST /api/safety/blocks
 */
export const blockUser = async (targetUserId: string): Promise<ApiResponse<Block>> => {
  return apiClient.post('/safety/blocks', { targetUserId });
};

/**
 * 사용자 차단 해제
 * DELETE /api/safety/blocks/{targetUserId}
 */
export const unblockUser = async (targetUserId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/safety/blocks/${targetUserId}`);
};

/**
 * 사용자 신고
 * POST /api/safety/reports
 */
export const reportUser = async (data: ReportUserRequest): Promise<ApiResponse<Report>> => {
  return apiClient.post('/safety/reports', data);
};

/**
 * 내가 제출한 신고 목록
 * GET /api/safety/reports/me
 */
export const getMyReports = async (): Promise<ApiResponse<Report[]>> => {
  return apiClient.get('/safety/reports/me');
};

// ============================================
// 📍 알림
// ============================================

/**
 * 알림 목록 조회
 * GET /api/v1/notifications
 */
export const getNotifications = async (limit: number = 20): Promise<ApiResponse<Notification[]>> => {
  return apiClient.get(`/v1/notifications?limit=${limit}`);
};

/**
 * 알림 읽음 처리
 * PATCH /api/v1/notifications/{id}/read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<ApiResponse<void>> => {
  return apiClient.patch(`/v1/notifications/${notificationId}/read`);
};

/**
 * 모든 알림 읽음 처리
 * POST /api/v1/notifications/read-all
 */
export const markAllNotificationsAsRead = async (): Promise<ApiResponse<void>> => {
  return apiClient.post('/v1/notifications/read-all');
};

/**
 * 알림 삭제
 * DELETE /api/v1/notifications/{id}
 */
export const deleteNotification = async (notificationId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/v1/notifications/${notificationId}`);
};

// ============================================
// 📍 설정
// ============================================

/**
 * 알림 설정 조회
 * GET /api/users/me/notification-settings
 */
export const getNotificationSettings = async (): Promise<ApiResponse<NotificationSettings>> => {
  return apiClient.get('/users/me/notification-settings');
};

/**
 * 알림 설정 변경
 * PUT /api/users/me/notification-settings
 */
export const updateNotificationSettings = async (settings: UpdateNotificationSettingsRequest): Promise<ApiResponse<void>> => {
  return apiClient.put('/users/me/notification-settings', settings);
};

/**
 * 회원 탈퇴
 * DELETE /api/users/me
 */
export const deleteAccount = async (reason?: string): Promise<ApiResponse<void>> => {
  return apiClient.delete('/users/me', { data: { reason } });
};

const mypageApi = {
  // 프로필
  getMyProfile,
  getUserProfile,
  updateProfile,
  updateProfileImage,
  deleteProfileImage,
  // 내 모임
  getMyMeetings,
  getHostedMeetings,
  getJoinedMeetings,
  getPendingMeetings,
  getLikedMeetings,
  // 통계
  getMyStats,
  getMyReputation,
  getUserReputation,
  // 리뷰
  getMyReviews,
  getMyWrittenReviews,
  writeReview,
  // 신고/차단
  getBlocks,
  blockUser,
  unblockUser,
  reportUser,
  getMyReports,
  // 알림
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  // 설정
  getNotificationSettings,
  updateNotificationSettings,
  deleteAccount,
};

export default mypageApi;