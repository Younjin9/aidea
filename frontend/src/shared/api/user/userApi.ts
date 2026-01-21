import apiClient from '../client';
import type { ApiResponse } from '@/shared/types/common.types';
import type { LocationUpdate } from '@/shared/types/common.types';
import type {
  User,
  UserProfile,
  UpdateProfileRequest,
  UpdateProfileImageResponse,
  UserStats,
  NotificationSettings,
  UpdateNotificationSettingsRequest,
  DeleteAccountRequest,
} from '@/shared/types/User.types';
import type { Meeting } from '@/shared/types/Meeting.types';

// ============================================
// 👤 User API - 마이페이지
// ============================================

/**
 * 내 프로필 조회
 * GET /api/users/me
 */
export const getMyProfile = async (): Promise<ApiResponse<UserProfile>> => {
  return apiClient.get('/users/me');
};

/**
 * 내 프로필 수정
 * PATCH /api/users/me
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
  return apiClient.patch('/users/me', data);
};

/**
 * 프로필 이미지 변경
 * POST /api/users/me/profile-image
 */
export const updateProfileImage = async (image: File): Promise<ApiResponse<UpdateProfileImageResponse>> => {
  const formData = new FormData();
  formData.append('image', image);

  return apiClient.post('/users/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * 내 위치 업데이트
 * PUT /api/users/me/location
 */
export const updateLocation = async (data: LocationUpdate): Promise<ApiResponse<{ updated: boolean; location: any }>> => {
  return apiClient.put('/users/me/location', data);
};

/**
 * 내가 가입한 모임 목록
 * GET /api/users/me/groups
 */
export const getMyMeetings = async (status?: 'active' | 'all'): Promise<ApiResponse<Meeting[]>> => {
  const params = status ? `?status=${status}` : '';
  return apiClient.get(`/users/me/groups${params}`);
};

/**
 * 내가 주최하는 모임 목록
 * GET /api/users/me/groups/hosting
 */
export const getMyHostingMeetings = async (): Promise<ApiResponse<Meeting[]>> => {
  return apiClient.get('/users/me/groups/hosting');
};

/**
 * 내 활동 통계
 * GET /api/users/me/stats
 */
export const getMyStats = async (): Promise<ApiResponse<UserStats>> => {
  return apiClient.get('/users/me/stats');
};

/**
 * 알림 설정 조회
 * GET /api/users/me/notifications/settings
 */
export const getNotificationSettings = async (): Promise<ApiResponse<NotificationSettings>> => {
  return apiClient.get('/users/me/notifications/settings');
};

/**
 * 알림 설정 변경
 * PATCH /api/users/me/notifications/settings
 */
export const updateNotificationSettings = async (
  data: UpdateNotificationSettingsRequest
): Promise<ApiResponse<NotificationSettings>> => {
  return apiClient.patch('/users/me/notifications/settings', data);
};

/**
 * 회원 탈퇴
 * DELETE /api/users/me
 */
export const deleteAccount = async (data?: DeleteAccountRequest): Promise<ApiResponse<void>> => {
  return apiClient.delete('/users/me', { data });
};

const userApi = {
  getMyProfile,
  updateProfile,
  updateProfileImage,
  updateLocation,
  getMyMeetings,
  getMyHostingMeetings,
  getMyStats,
  getNotificationSettings,
  updateNotificationSettings,
  deleteAccount,
};

export default userApi;
