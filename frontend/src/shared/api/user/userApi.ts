import apiClient from '../client';
import type { ApiResponse } from '@/shared/types/common.types';
import type { LocationUpdate } from '@/shared/types/common.types';
import type {
  // User,
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
  return apiClient.get('/api/users/me');
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
  return apiClient.patch('/api/users/me', data);
};

export const updateProfileImage = async (image: File): Promise<ApiResponse<UpdateProfileImageResponse>> => {
  const formData = new FormData();
  formData.append('image', image);

  return apiClient.post('/api/users/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateLocation = async (data: LocationUpdate): Promise<ApiResponse<{ updated: boolean; location: any }>> => {
  return apiClient.put('/api/users/me/location', data);
};

export const getMyMeetings = async (status?: 'active' | 'all'): Promise<ApiResponse<Meeting[]>> => {
  const params = status ? `?status=${status}` : '';
  return apiClient.get(`/api/users/me/groups${params}`);
};

export const getMyHostingMeetings = async (): Promise<ApiResponse<Meeting[]>> => {
  return apiClient.get('/api/users/me/groups/hosting');
};

export const getMyStats = async (): Promise<ApiResponse<UserStats>> => {
  return apiClient.get('/api/users/me/stats');
};

export const getNotificationSettings = async (): Promise<ApiResponse<NotificationSettings>> => {
  return apiClient.get('/api/users/me/notifications/settings');
};

export const updateNotificationSettings = async (
  data: UpdateNotificationSettingsRequest
): Promise<ApiResponse<NotificationSettings>> => {
  return apiClient.patch('/api/users/me/notifications/settings', data);
};

export const deleteAccount = async (data?: DeleteAccountRequest): Promise<ApiResponse<void>> => {
  return apiClient.delete('/api/users/me', { data });
};

/**
 * 관심사 카테고리 목록 조회
 * GET /api/interests/categories
 */
export const getInterestCategories = async (): Promise<ApiResponse<Array<{ id: string; name: string }>>> => {
  return apiClient.get('/api/interests/categories');
};

/**
 * 사용자 관심사 업데이트
 * PUT /api/users/interests
 */
export const updateUserInterests = async (interests: string[]): Promise<ApiResponse<void>> => {
  return apiClient.put('/api/users/interests', { interests });
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
  getInterestCategories,
  updateUserInterests,
};

export default userApi;
